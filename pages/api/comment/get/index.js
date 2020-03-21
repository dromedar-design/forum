import { serverClient } from '@utils/fauna'
import { query as q } from 'faunadb'

export default async (req, res) => {
  try {
    const response = await serverClient.query(
      q.Map(
        q.Paginate(
          // make paginatable
          q.Match(q.Index('all_comments'))
        ),
        ref => {
          return {
            id: q.Select(['id'], ref),
            item: q.Get(ref),
          }
        }
      )
    )

    res.status(200).json({
      items: response.data
        .filter(({ item }) => !item.data.parent)
        .map(({ id, item }) => ({
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
