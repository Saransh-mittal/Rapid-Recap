const { fakerEN_IN } = require("@faker-js/faker");
const User = require("../../model/userSchema");
const { progressBar } = require("../../utils/progress");
async function generatePicForUsers() {
  const updateProgress = progressBar(100);
  for (let i = 0; i < 100; i++) {
    const pic = fakerEN_IN.image.avatar();
    const user = await User.findOne({ email: `dummy${i}@mail.com` });
    const toUpdatePic = Math.random() > 0.6 ? true : false;
    if (toUpdatePic) {
      user.pic = pic;
      await user.save();
    }
    updateProgress();
  }
}
generatePicForUsers();
