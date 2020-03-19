import { query as q } from 'faunadb'
import { serverClient } from '../../../../utils/fauna'

export default async (req, res) => {
  const ref = q.Ref(q.Collection('comments'), req.query.id)

  try {
    const response = await serverClient.query({
      current: {
        id: q.Select(['id'], ref),
        item: q.Get(ref),
      },
      items: q.Map(
        // iterate each item in result
        q.Paginate(
          // make paginatable
          q.Match(
            // query index
            q.Index('comments_by_parent'), // specify source
            req.query.id
          )
        ),
        ref => {
          return {
            id: q.Select(['id'], ref),
            item: q.Get(ref),
          }
        }
      ),
    })

    res.status(200).json({
      current: {
        id: response.current.id,
        ...response.current.item.data,
      },
      items: response.items.data.map(({ id, item }) => ({
        id,
        ...item.data,
      })),
    })
  } catch (e) {
    console.log(e)

    res.status(e.requestResult.statusCode || 400).json({
      error: e.name,
      message: e.message,
    })
  }
}
