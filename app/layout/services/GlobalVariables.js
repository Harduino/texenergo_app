/**
 * Created by Egor Lobanov on 26.01.17.
 */
class GlobalVariables{
    constructor(){
        this.variables = {};
    }

    get globals(){
        return this.variables;
    }
}

angular.module('app.layout').service('globalVariables', GlobalVariables);