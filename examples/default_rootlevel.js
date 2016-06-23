var Beelzebub = require('../');
var beelzebub = Beelzebub.create({
   verbose: true
});

class MyRootLevel extends Beelzebub.Tasks {
    constructor(config) {
        super(config);
        this.$useAsRoot();
    }

    default(){
        this.logger.log('MyRootLevel myDefault');
    }

    task1(){
        this.logger.log('MyRootLevel task1');
    }

    task2(){
        this.logger.log('MyRootLevel task2');
    }
}

class MyTasks extends Beelzebub.Tasks {
    constructor(config) {
        super(config);
        this.$setDefault('myDefault');
    }

    myDefault(){
        this.logger.log('MyTasks myDefault');
    }
}

beelzebub.add( MyRootLevel );
beelzebub.add( MyTasks );


console.log('-------------------------');
beelzebub.run('default');
beelzebub.run('task1');
//beelzebub.run('blah');
beelzebub.run('task2');
