var userOne = {
    email:'ryu@ninjas.com',
    name: 'Ryu',
    login(){
        console.log(this.email, 'Has loged in.');
    },
    logout(){
        console.log(this.email, 'Has loged out.');
    }
};

var userTwo = {
    email:'yoshi@ninjas.com',
    name: 'Ryu',
    login(){
        console.log(this.email, 'Has loged in.');
    },
    logout(){
        console.log(this.email, 'Has loged out.');
    }
};

console.log(userOne.logout);