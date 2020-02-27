const transformLike = value => {
  switch (value) {
    case 'UP':
      return 2

    case 'DOWN':
      return -1

    case 'NULL':
      return 0

    default:
      return 0
  }
}

const COMMMENT_WEIGHT = 3
const HOURS = 4 // it will be boosted for this many hours
const DIVIDER = 4 // the inial spike is bigger if this number is smaller

// So if the 2 numbers are the same, the result is
//    - doubled at the time of posting it
//    - reaches the normal level after X hours

module.exports = {
  computePosition: ({ createdAt, commentCount, likeCount }) => {
    const rawNumber = (likeCount || 0) + (commentCount || 0) * COMMMENT_WEIGHT

    if (!createdAt) return rawNumber

    const diff = (new Date() - new Date(createdAt)) / 1000 / 60 / 60 // in hours
    const boost = Math.max(0, HOURS - diff)

    return Math.ceil((1 + boost / DIVIDER) * rawNumber)
  },
  computeLikeCount: likes =>
    !likes.length
      ? 0
      : likes.reduce((sum, like) => {
          return sum + transformLike(like.value)
        }, 0),
}
