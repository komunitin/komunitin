import { Account, Currency, ExtendedTransfer, Member } from 'src/store/model'
import { LoadPayload } from 'src/store/resources'
import { Store, useStore } from 'vuex'

/**
 * Loads a transfer and all associated resources: account, member,
 * currency and group for both payer and payee.
 * 
 * For some external transfers, depending on external group configuration,
 * it won't be possible to fetch the member object.
 */
export const useFullTransfer = async (group: string, id: string): Promise<ExtendedTransfer> => {
  const store = useStore()
  // Load transfer and accounts. Note that this call already loads accounts
  // even if they are external. Also note that this updates the current logged
  // in account (if involved in transfer) and hence its balance.
  await store.dispatch('transfers/load', { 
    id,
    group,
    include: "payer,payee"
  } as LoadPayload)
  
  const transfer = store.getters['transfers/current']
  
  const isExternalPayer = transfer.relationships.payer.data.meta?.external
  const isExternalPayee = transfer.relationships.payee.data.meta?.external

  // Load local members (except for the logged in account which is already loaded).
  const myAccount = store.getters.myAccount

  const localAccountIds = []
  if (!isExternalPayer && transfer.payer.id !== myAccount.id) {
    localAccountIds.push(transfer.payer.id)
  }
  if (!isExternalPayee && transfer.payee.id !== myAccount.id) {
    localAccountIds.push(transfer.payee.id)
  }
  if (localAccountIds.length > 0) {
    await store.dispatch("members/loadList", {
      group: group,
      filter: {
        account: localAccountIds.join(",")
      },
      onlyResources: true
    })
  }
  // If there are no external accounts we're done, since we have accounts, members 
  // and also currency and group since they are the same as the ones for the logged 
  // in account.
  if (isExternalPayee) {
    await loadExternalAccountRelationships(transfer.payee, store)
  }
  if (isExternalPayer) {
    await loadExternalAccountRelationships(transfer.payer, store)
  }

  return transfer
}

const loadExternalAccountRelationships = async (account: Account & {member?: Member, currency?: Currency}, store: Store<unknown>) => {
  const accountUrl = account.links.self
  const urlPrefix = accountUrl.substring(0, accountUrl.indexOf("/accounts/"))

  const group = urlPrefix.substring(urlPrefix.lastIndexOf("/") + 1)
  const baseUrl = urlPrefix.substring(0, urlPrefix.lastIndexOf("/"))

  // load currency if required. This works even with remote servers.
  if (!account.currency) {
    await store.dispatch("currencies/load", {
      url: `${baseUrl}/${group}/currency`,
      group
    })
  }
  // load members and group if required. Note that this only works if
  // they are using the same social server as the logged in user. That
  // could be expanded to remote servers if we add a way to get the social
  // api url related to a specific currency.
  if (!account.member) {
    await store.dispatch("members/loadList", {
      group,
      filter: {
        account: account.id
      },
      include: "group",
      onlyResources: true
    })
  }
}