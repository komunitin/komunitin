import { MaybeRefOrGetter, toValue } from "@vueuse/core"
import { ExtendedAccount } from "src/store/model"
import { ref, watchEffect } from "vue"
import { useStore } from "vuex"

export const useFullAccountByMemberCode = (groupCode: MaybeRefOrGetter<string>, memberCode: MaybeRefOrGetter<string|undefined>, options?: {
  cache?: boolean
}) => {
  const store = useStore()

  const account = ref<ExtendedAccount>()
  const ready = ref(false)

  const fetchAccount = async () => {
    const memberCodeStr = toValue(memberCode)
    const groupCodeStr = toValue(groupCode)

    if (!memberCodeStr) {
      account.value = undefined
      return
    }
    // Try get member from cache
    const member = account.value = store.getters["members/find"]({code: memberCodeStr})
    if (member && member.group && member.account) {
      account.value = member.account
      ready.value = true
      return
    }
    if (!options?.cache || !member || !member.group || !member.account) {
      // Load account from server
      await store.dispatch("members/load", {
        code: memberCodeStr,
        group: groupCodeStr,
        include: "account,group",
      })
      account.value = store.getters["members/find"]({code: memberCodeStr}).account
      ready.value = true
    }
  }

  watchEffect(fetchAccount)

  return {
    account,
    ready
  }
}

const useCreateTransferAccount = (groupCode: string, memberCode: string|undefined, direction: "send"|"receive"|"transfer", checkDirection: "send"|"receive") => {
  if (direction === checkDirection) {
    if (memberCode) {
      const {account} = useFullAccountByMemberCode(groupCode, memberCode, {cache: true})
      return account
    } else {
      const store = useStore()
      return ref<ExtendedAccount>(store.getters.myAccount)
    }
  } else {
    return ref<ExtendedAccount>()
  }
}

export const useCreateTransferPayerAccount = (groupCode: string, memberCode: string|undefined, direction: "send"|"receive"|"transfer") => {
  return useCreateTransferAccount(groupCode, memberCode, direction, "send")
}

export const useCreateTransferPayeeAccount = (groupCode: string, memberCode: string|undefined, direction: "send"|"receive"|"transfer") => {
  return useCreateTransferAccount(groupCode, memberCode, direction, "receive")
}

