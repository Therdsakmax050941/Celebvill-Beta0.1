const ChatTopic = require("./chatTopic.model");
const User = require("../user/user.model");
const dayjs = require("dayjs");
const arrayShuffle = require("shuffle-array");
// create chat topic
exports.store = async (req, res) => {
  try {
    if (!req.body.senderUserId || !req.body.receiverUserId)
      return res
        .status(200)
        .json({ status: false, message: "Invalid Details!" });

    const senderUser = await User.findById(req.body.senderUserId);
    if (!senderUser)
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!" });
    const receiverUser = await User.findById(req.body.receiverUserId);
    if (!receiverUser)
      return res
        .status(200)
        .json({ status: false, message: "User dose not Exist!" });

    const chatTopic = await ChatTopic.findOne({
      $or: [
        {
          $and: [
            { senderUser: senderUser._id },
            { receiverUser: receiverUser._id },
          ],
        },
        {
          $and: [
            { receiverUser: senderUser._id },
            { senderUser: receiverUser._id },
          ],
        },
      ],
    });
    if (chatTopic) {
      return res
        .status(200)
        .json({ status: true, message: "Success!!", chatTopic });
    }
 
    const newChatTopic = new ChatTopic();
    newChatTopic.senderUser = senderUser._id;
    newChatTopic.receiverUser = receiverUser._id;
    await newChatTopic.save();

    return res
      .status(200)
      .json({ status: true, message: "Success!!", chatTopic: newChatTopic });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error !",
    });
  }
};

exports.getChatList = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res
        .status(200)
        .json({ status: false, message: "User does not Exist!" });
    }

    const fakeData = await User.find({ isFake: true });
    const fakeUser = await arrayShuffle(fakeData);

    var fakeChatList = [];

    for (let index = 0; index < fakeUser.length; index++) {
      const element = fakeUser[index];

      var obj = {
        topic: null,
        message: " hello !",
        date: null,
        chatDate: null,
        userId: element._id,
        name: element.name,
        username: element.username,
        image: element.image,
        country: element.country,
        isVIP: element.isVIP,
        link: element.link,
        time: " Just now",
        isFake: true,
      };
      fakeChatList.push(obj);
    }

    const list = await ChatTopic.aggregate([
      {
        $match: { $or: [{ senderUser: user._id }, { receiverUser: user._id }] },
      },
      {
        $lookup: {
          from: "users",
          as: "user",
          let: {
            receiverUserIds: "$receiverUser",
            senderUserIds: "$senderUser",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $cond: {
                    if: { $eq: ["$$senderUserIds", user._id] },
                    then: { $eq: ["$$receiverUserIds", "$_id"] },
                    else: { $eq: ["$$senderUserIds", "$_id"] },
                  },
                },
              },
            },
            {
              $project: {
                name: 1,
                username: 1,
                image: 1,
                country: 1,
                isVIP: 1,
                isFake: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: "chats",
          localField: "chat",
          foreignField: "_id",
          as: "chat",
        },
      },
      {
        $unwind: {
          path: "$chat",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          topic: "$_id",
          message: "$chat.message",
          date: "$chat.date", //
          chatDate: {
            // sorting date
            $dateFromString: {
              dateString: "$chat.date",
            },
          },
          userId: "$user._id",
          name: "$user.name",
          username: "$user.username",
          image: "$user.image",
          country: "$user.country",
          isVIP: "$user.isVIP",
          isFake: "$user.isFake",
        },
      },
      {
        $addFields: {
          isFake: false,
        },
      },
      { $sort: { chatDate: -1 } },
      {
        $facet: {
          chatList: [
            { $skip: req.query.start ? parseInt(req.query.start) : 0 }, // how many records you want to skip
            { $limit: req.query.limit ? parseInt(req.query.limit) : 20 },
          ],
        },
      },
    ]);

    let now = dayjs();

    const chatList = list[0].chatList.map((data) => ({
      ...data,
      time:
        now.diff(data.date, "minute") <= 60 &&
        now.diff(data.date, "minute") >= 0
          ? now.diff(data.date, "minute") + " minutes ago"
          : now.diff(data.date, "hour") >= 24
          ? dayjs(data.date).format("DD MMM, YYYY")
          : now.diff(data.date, "hour") + " hour ago",
    }));

    if (req.query.isFake === "false") {
      return res.status(200).json({
        status: true,
        message: "Success!!",
        chatList: chatList.length > 0 ? chatList : [],
      });
    }else{
      return res.status(200).json({
        status: true,
        message: "Success!!",
        chatList: chatList.length > 0 ? chatList : fakeChatList,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      error: error.message || "Server Error",
    });
  }
};
