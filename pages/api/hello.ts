import { NextApiRequest, NextApiResponse } from 'next';
import nameGenerator from 'project-name-generator';

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    name: nameGenerator().dashed,
  });
}
