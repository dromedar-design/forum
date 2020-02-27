const userIsAdmin = ({ authentication }) => {
  if (!authentication.item) return false
  return Boolean(authentication.item.isAdmin)
}
const userOwnsItem = ({ authentication, existingItem }) => {
  if (!existingItem) return false
  if (!authentication.item) return false
  return authentication.item.id === existingItem.id
}
const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth)
  const isOwner = access.userOwnsItem(auth)
  return isAdmin ? isAdmin : isOwner
}
module.exports = { userIsAdmin, userOwnsItem, userIsAdminOrOwner }
