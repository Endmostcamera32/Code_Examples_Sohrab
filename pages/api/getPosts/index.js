import {prisma} from "../../../server/db/client"

export default async function handler(req, res) {
    const allPosts =  await prisma.post.findMany({
        include: {
          user: true,
          comments:true,
          likes: true
        },
      })

      allPosts.map(m => {
        let howManyComments = m.comments.length
        m.totalComments = howManyComments
        let howManyLikes = m.likes.length
        m.totalLikes = howManyLikes
      })
    const jsonPosts = JSON.parse(JSON.stringify(allPosts))
    res.status(200).json(jsonPosts)
}