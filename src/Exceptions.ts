export class RuleTypeNotFoundException extends Error {
    name: string;
    message: string;
    stack?: string;
    
    constructor(name: string){
        let message = `The rule of type ${name} is not known.`;
        super(message);
        this.name = name;
        this.message = message;
    }
}

export class InvalidGetOutputCallOnGenericRuleType extends Error {
    name: string;
    message: string;
    stack?: string;
    
    constructor(name: string){
        let message = `Invalid call for method ${name} on GenericRule class. This method call should be on the concrete rule class.`;
        super(message);
        this.name = name;
        this.message = message;   
    }
}