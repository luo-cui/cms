// 存储了 token 之后若未做移除， token 是永久的，所以需要设置过期时间
const TokenKey = 'admin_user_token'
const TokenExpireKey = 'admin_user_token_expire'

// 获取 token
export function getToken(){
    // return localStorage.getItem(TokenKey)
    // 用变量接收
    let token = localStorage.getItem(TokenKey)
    // 获取token中的过期时间
    let expire = localStorage.getItem(TokenExpireKey)
    // 判断是否超时
    if(new Date().getTime() > expire){
        removeToken()
        token = null
    }
    // 如果不存在token，则返回的是 null
    return token
}

// 设置 token
export function setToken(token){
    localStorage.setItem(TokenKey,token)
    // 1s = 1000ms,60s*60m=1h
    localStorage.setItem(TokenExpireKey,new Date().getTime()+60*60*1000)
}

// 删除 token
export function removeToken(){
    localStorage.removeItem(TokenKey)
    localStorage.removeItem(TokenExpireKey)    
}

