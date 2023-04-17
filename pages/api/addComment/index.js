import { prisma } from "../../../server/db/client";
import titleFromCode from "../../../utils/titleFromCode";

export default async function handler(req, res) {
  const { inputText, user, postId } = req.body;

  const userFromDb = await prisma.user.findUnique({
    where: {
        email: user.email
    },
  });
  const comment = await prisma.comment.create({
    data: {
      content: inputText,
      userId: userFromDb.id,
      postId: postId,
    },
  });

  res.status(200).json({ name: "John Doe" });
}
