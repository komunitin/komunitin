import { GroupsState } from "./modules/groups";
import { CategoriesState } from "./modules/categories";
import { ContactsState } from "./modules/contacts";

export default interface State {
    groups: GroupsState,
    contacts: ContactsState
    categories: CategoriesState,
}