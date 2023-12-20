
import { KEYS } from "./config";
import { IS_TEST } from "./env";

const PROD_KEY = KEYS.PROD;
const TEST_KEY = KEYS.TEST;

export function getKey() {
    try {
        return IS_TEST ? TEST_KEY : PROD_KEY;
    } catch (error) {
        return TEST_KEY;
    }
};