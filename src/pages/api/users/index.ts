import type { NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import User from "@/model/user";
import { AuthenticatedRequest, authenticateUser } from "@/utils/middleware";

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const user = await User.findById(req.user!.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default authenticateUser(handler);
