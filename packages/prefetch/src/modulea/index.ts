// 使用箭头函数
export const greet = (name) => {
    console.log(`Hello, ${name}!`);
};

greet('Monica');

// 使用模板字符串
const product = 'smartphone';
const price = 500;
console.log(`The ${product} costs $${price}.`);

// 使用解构赋值
const person = { name: 'Alice', age: 30, country: 'USA' };
const { name, age } = person;
console.log(`${name} is ${age} years old.`);

// 使用 let 和 const
let counter = 0;
counter++;
console.log(counter);

export const PI = 3.14;
// PI = 3.14159; // 会导致错误，因为常量不可重新赋值

// 使用 Promise 和 async/await
export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function delayedGreeting() {
    await delay(1000);
    console.log('Delayed Hello!');
}

delayedGreeting();

// 使用类和模块化
export class Animal {
    public name: string;
    constructor(name) {
        this.name = name;
    }

    speak() {
        console.log(this.name + ' makes a noise.');
    }
}

export default Animal;
