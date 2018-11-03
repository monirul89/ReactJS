function User (email, name){
    this.email = email;
    this.name = name;
    this.online = false;
}

User.prototype.login = function(){
    this.online = true;
    console.log(this.email, 'just login');
}

User.prototype.logout = function(){
    this.online = false;
    console.log(this.email, 'just logout');
}

function Admin(...args){
    User.apply(this, args);
    this.role = "usper admin";
}

Admin.prototype = Object.create(User.prototype);
Admin.prototype.deleteUser = function(){
    
}




var userOne  = new User('monirul@gmail.com', 'Monir');
var userTwo  = new User('yahman@gmail.com', 'Yahman');
var Admin = new Admin('Moniru@gmail.com', 'Monirul');

console.log(userTwo.email, userTwo.name);
console.log(Admin);