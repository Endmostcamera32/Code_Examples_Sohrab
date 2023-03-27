import {prisma} from "../../../server/db/client"
import titleFromCode from "../../../utils/titleFromCode"

export default async function handler(req, res) {
        const {text} = req.body
        const titleOfThePost = titleFromCode(text)
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.userEmail
            }
        })
        console.log(user)
        const post = await prisma.post.create({
            data: {
              code: req.body.text,
              language: req.body.language,
              userId: user.id,
              title: titleOfThePost
            },
          })    

    res.status(200).json({ name: 'John Doe' })
}
  