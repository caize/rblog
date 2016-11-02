import mongoose from 'mongoose';
import md5 from '../common/md5';

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

userSchema.statics.add = async function(ctx, user) {
    let document = await this.findOne({ email: user.email });
    if (document) {
        return { status: 'error', msg: '此邮箱已注册' };
    }

    user.password = md5(user.password);
    let u = await user.save();
    user.password = null;
    delete user.password;
    ctx.session.user = user;
    return { status: 'success', msg: '注册成功', user };
};

userSchema.statics.login = async function(ctx, email, password) {
    let user = await this.findOne({ email });

    if (user) {
        if (md5(password) === user.password) {
            user.password = null;
            delete user.password;
            ctx.session.user = user;

            return { status: 'success', msg: '登录成功', user };
        }
        return { status: 'error', msg: '密码错误', user };
    }

    return { status: 'error', msg: '邮箱未注册', user };
};

let User = mongoose.model('User', userSchema);

export { User };

