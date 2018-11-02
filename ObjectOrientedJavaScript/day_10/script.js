function User (email, name){
    this.email = email;
    this.name = name;
    this.online = false;
    this.login = function(){
        console.log(this.email, 'has logged in.');
    }

}

var userOne  = new User('monirul@gmail.com', 'Monir');
var userTwo  = new User('yahman@gmail.com', 'Yahman');

console.log(userTwo.email, userTwo.name);


// class User{
//     constructor(email, name){
//         this.email = email;
//         this.name = name;
//         this.score = 0;

//     }
//     login(){
//         console.log(this.email, 'Just logged in');
//         return this;
//     }
    
//     logOut(){
//         console.log(this.email, 'Just logged Out');
//         return this;
//     }

//     updateScore(){
//         this.score++;
//         console.log(this.email, 'Score is now', this.score);
//         return this;

//     }
// }

// var userOne = new User('Ryu@ninjas.com', 'Ryu');
// var userTwo = new User('yoshi@ninjas.com', 'yoshi')

// userOne.login().updateScore().updateScore().logOut();