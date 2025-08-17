(function() {
var __webpack_modules__ = {
"973": (function (module, exports, __webpack_require__) {
(function(root, factory) {
    if (typeof exports === "object") // CommonJS
    module.exports = exports = factory();
    else if (typeof define === "function" && define.amd) // AMD
    define([], factory);
    else // Global (browser)
    root.CryptoJS = factory();
})(this, function() {
    /*globals window, global, require*/ /**
	 * CryptoJS core components.
	 */ var CryptoJS = CryptoJS || function(Math1, undefined) {
        var crypto;
        // Native crypto from window (Browser)
        if (typeof window !== 'undefined' && window.crypto) crypto = window.crypto;
        // Native crypto in web worker (Browser)
        if (typeof self !== 'undefined' && self.crypto) crypto = self.crypto;
        // Native crypto from worker
        if (typeof globalThis !== 'undefined' && globalThis.crypto) crypto = globalThis.crypto;
        // Native (experimental IE 11) crypto from window (Browser)
        if (!crypto && typeof window !== 'undefined' && window.msCrypto) crypto = window.msCrypto;
        // Native crypto from global (NodeJS)
        if (!crypto && typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g.crypto) crypto = __webpack_require__.g.crypto;
        // Native crypto import via require (NodeJS)
        if (!crypto && 'function' === 'function') try {
            crypto = __webpack_require__("532");
        } catch (err) {}
        /*
	     * Cryptographically secure pseudorandom number generator
	     *
	     * As Math.random() is cryptographically not safe to use
	     */ var cryptoSecureRandomInt = function() {
            if (crypto) {
                // Use getRandomValues method (Browser)
                if (typeof crypto.getRandomValues === 'function') try {
                    return crypto.getRandomValues(new Uint32Array(1))[0];
                } catch (err) {}
                // Use randomBytes method (NodeJS)
                if (typeof crypto.randomBytes === 'function') try {
                    return crypto.randomBytes(4).readInt32LE();
                } catch (err1) {}
            }
            throw new Error('Native crypto module could not be used to get secure random number.');
        };
        /*
	     * Local polyfill of Object.create

	     */ var create = Object.create || function() {
            function F() {}
            return function(obj) {
                var subtype;
                F.prototype = obj;
                subtype = new F();
                F.prototype = null;
                return subtype;
            };
        }();
        /**
	     * CryptoJS namespace.
	     */ var C = {};
        /**
	     * Library namespace.
	     */ var C_lib = C.lib = {};
        /**
	     * Base object for prototypal inheritance.
	     */ var Base = C_lib.Base = function() {
            return {
                /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */ extend: function(overrides) {
                    // Spawn
                    var subtype = create(this);
                    // Augment
                    if (overrides) subtype.mixIn(overrides);
                    // Create default initializer
                    if (!subtype.hasOwnProperty('init') || this.init === subtype.init) subtype.init = function() {
                        subtype.$super.init.apply(this, arguments);
                    };
                    // Initializer's prototype is the subtype object
                    subtype.init.prototype = subtype;
                    // Reference supertype
                    subtype.$super = this;
                    return subtype;
                },
                /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */ create: function() {
                    var instance = this.extend();
                    instance.init.apply(instance, arguments);
                    return instance;
                },
                /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */ init: function() {},
                /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */ mixIn: function(properties) {
                    for(var propertyName in properties)if (properties.hasOwnProperty(propertyName)) this[propertyName] = properties[propertyName];
                    // IE won't copy toString using the loop above
                    if (properties.hasOwnProperty('toString')) this.toString = properties.toString;
                },
                /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */ clone: function() {
                    return this.init.prototype.extend(this);
                }
            };
        }();
        /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */ var WordArray = C_lib.WordArray = Base.extend({
            /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */ init: function(words, sigBytes) {
                words = this.words = words || [];
                if (sigBytes != undefined) this.sigBytes = sigBytes;
                else this.sigBytes = words.length * 4;
            },
            /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */ toString: function(encoder) {
                return (encoder || Hex).stringify(this);
            },
            /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */ concat: function(wordArray) {
                // Shortcuts
                var thisWords = this.words;
                var thatWords = wordArray.words;
                var thisSigBytes = this.sigBytes;
                var thatSigBytes = wordArray.sigBytes;
                // Clamp excess bits
                this.clamp();
                // Concat
                if (thisSigBytes % 4) // Copy one byte at a time
                for(var i = 0; i < thatSigBytes; i++){
                    var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                    thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
                }
                else // Copy one word at a time
                for(var j = 0; j < thatSigBytes; j += 4)thisWords[thisSigBytes + j >>> 2] = thatWords[j >>> 2];
                this.sigBytes += thatSigBytes;
                // Chainable
                return this;
            },
            /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */ clamp: function() {
                // Shortcuts
                var words = this.words;
                var sigBytes = this.sigBytes;
                // Clamp
                words[sigBytes >>> 2] &= 0xffffffff << 32 - sigBytes % 4 * 8;
                words.length = Math1.ceil(sigBytes / 4);
            },
            /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */ clone: function() {
                var clone = Base.clone.call(this);
                clone.words = this.words.slice(0);
                return clone;
            },
            /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */ random: function(nBytes) {
                var words = [];
                for(var i = 0; i < nBytes; i += 4)words.push(cryptoSecureRandomInt());
                return new WordArray.init(words, nBytes);
            }
        });
        /**
	     * Encoder namespace.
	     */ var C_enc = C.enc = {};
        /**
	     * Hex encoding strategy.
	     */ var Hex = C_enc.Hex = {
            /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */ stringify: function(wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;
                // Convert
                var hexChars = [];
                for(var i = 0; i < sigBytes; i++){
                    var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                    hexChars.push((bite >>> 4).toString(16));
                    hexChars.push((bite & 0x0f).toString(16));
                }
                return hexChars.join('');
            },
            /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */ parse: function(hexStr) {
                // Shortcut
                var hexStrLength = hexStr.length;
                // Convert
                var words = [];
                for(var i = 0; i < hexStrLength; i += 2)words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
                return new WordArray.init(words, hexStrLength / 2);
            }
        };
        /**
	     * Latin1 encoding strategy.
	     */ var Latin1 = C_enc.Latin1 = {
            /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */ stringify: function(wordArray) {
                // Shortcuts
                var words = wordArray.words;
                var sigBytes = wordArray.sigBytes;
                // Convert
                var latin1Chars = [];
                for(var i = 0; i < sigBytes; i++){
                    var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
                    latin1Chars.push(String.fromCharCode(bite));
                }
                return latin1Chars.join('');
            },
            /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */ parse: function(latin1Str) {
                // Shortcut
                var latin1StrLength = latin1Str.length;
                // Convert
                var words = [];
                for(var i = 0; i < latin1StrLength; i++)words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << 24 - i % 4 * 8;
                return new WordArray.init(words, latin1StrLength);
            }
        };
        /**
	     * UTF-8 encoding strategy.
	     */ var Utf8 = C_enc.Utf8 = {
            /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */ stringify: function(wordArray) {
                try {
                    return decodeURIComponent(escape(Latin1.stringify(wordArray)));
                } catch (e) {
                    throw new Error('Malformed UTF-8 data');
                }
            },
            /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */ parse: function(utf8Str) {
                return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
            }
        };
        /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */ var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
            /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */ reset: function() {
                // Initial values
                this._data = new WordArray.init();
                this._nDataBytes = 0;
            },
            /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */ _append: function(data) {
                // Convert string to WordArray, else assume WordArray already
                if (typeof data == 'string') data = Utf8.parse(data);
                // Append
                this._data.concat(data);
                this._nDataBytes += data.sigBytes;
            },
            /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */ _process: function(doFlush) {
                var processedWords;
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;
                var dataSigBytes = data.sigBytes;
                var blockSize = this.blockSize;
                var blockSizeBytes = blockSize * 4;
                // Count blocks ready
                var nBlocksReady = dataSigBytes / blockSizeBytes;
                if (doFlush) // Round up to include partial blocks
                nBlocksReady = Math1.ceil(nBlocksReady);
                else // Round down to include only full blocks,
                // less the number of blocks that must remain in the buffer
                nBlocksReady = Math1.max((nBlocksReady | 0) - this._minBufferSize, 0);
                // Count words ready
                var nWordsReady = nBlocksReady * blockSize;
                // Count bytes ready
                var nBytesReady = Math1.min(nWordsReady * 4, dataSigBytes);
                // Process blocks
                if (nWordsReady) {
                    for(var offset = 0; offset < nWordsReady; offset += blockSize)// Perform concrete-algorithm logic
                    this._doProcessBlock(dataWords, offset);
                    // Remove processed words
                    processedWords = dataWords.splice(0, nWordsReady);
                    data.sigBytes -= nBytesReady;
                }
                // Return processed words
                return new WordArray.init(processedWords, nBytesReady);
            },
            /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */ clone: function() {
                var clone = Base.clone.call(this);
                clone._data = this._data.clone();
                return clone;
            },
            _minBufferSize: 0
        });
        /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */ var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
            /**
	         * Configuration options.
	         */ cfg: Base.extend(),
            /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */ init: function(cfg) {
                // Apply config defaults
                this.cfg = this.cfg.extend(cfg);
                // Set initial values
                this.reset();
            },
            /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */ reset: function() {
                // Reset data buffer
                BufferedBlockAlgorithm.reset.call(this);
                // Perform concrete-hasher logic
                this._doReset();
            },
            /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */ update: function(messageUpdate) {
                // Append
                this._append(messageUpdate);
                // Update the hash
                this._process();
                // Chainable
                return this;
            },
            /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */ finalize: function(messageUpdate) {
                // Final message update
                if (messageUpdate) this._append(messageUpdate);
                // Perform concrete-hasher logic
                var hash = this._doFinalize();
                return hash;
            },
            blockSize: 16,
            /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */ _createHelper: function(hasher) {
                return function(message, cfg) {
                    return new hasher.init(cfg).finalize(message);
                };
            },
            /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */ _createHmacHelper: function(hasher) {
                return function(message, key) {
                    return new C_algo.HMAC.init(hasher, key).finalize(message);
                };
            }
        });
        /**
	     * Algorithm namespace.
	     */ var C_algo = C.algo = {};
        return C;
    }(Math);
    return CryptoJS;
});
}),
"970": (function (module, exports, __webpack_require__) {
(function(root, factory) {
    if (typeof exports === "object") // CommonJS
    module.exports = exports = factory(__webpack_require__("973"));
    else if (typeof define === "function" && define.amd) // AMD
    define([
        "./core"
    ], factory);
    else // Global (browser)
    factory(root.CryptoJS);
})(this, function(CryptoJS) {
    (function(Math1) {
        // Shortcuts
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        // Initialization and round constants tables
        var H = [];
        var K = [];
        // Compute constants
        (function() {
            function isPrime(n) {
                var sqrtN = Math1.sqrt(n);
                for(var factor = 2; factor <= sqrtN; factor++){
                    if (!(n % factor)) return false;
                }
                return true;
            }
            function getFractionalBits(n) {
                return (n - (n | 0)) * 0x100000000 | 0;
            }
            var n = 2;
            var nPrime = 0;
            while(nPrime < 64){
                if (isPrime(n)) {
                    if (nPrime < 8) H[nPrime] = getFractionalBits(Math1.pow(n, 0.5));
                    K[nPrime] = getFractionalBits(Math1.pow(n, 1 / 3));
                    nPrime++;
                }
                n++;
            }
        })();
        // Reusable object
        var W = [];
        /**
	     * SHA-256 hash algorithm.
	     */ var SHA256 = C_algo.SHA256 = Hasher.extend({
            _doReset: function() {
                this._hash = new WordArray.init(H.slice(0));
            },
            _doProcessBlock: function(M, offset) {
                // Shortcut
                var H = this._hash.words;
                // Working variables
                var a = H[0];
                var b = H[1];
                var c = H[2];
                var d = H[3];
                var e = H[4];
                var f = H[5];
                var g = H[6];
                var h = H[7];
                // Computation
                for(var i = 0; i < 64; i++){
                    if (i < 16) W[i] = M[offset + i] | 0;
                    else {
                        var gamma0x = W[i - 15];
                        var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
                        var gamma1x = W[i - 2];
                        var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
                        W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
                    }
                    var ch = e & f ^ ~e & g;
                    var maj = a & b ^ a & c ^ b & c;
                    var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
                    var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
                    var t1 = h + sigma1 + ch + K[i] + W[i];
                    var t2 = sigma0 + maj;
                    h = g;
                    g = f;
                    f = e;
                    e = d + t1 | 0;
                    d = c;
                    c = b;
                    b = a;
                    a = t1 + t2 | 0;
                }
                // Intermediate hash value
                H[0] = H[0] + a | 0;
                H[1] = H[1] + b | 0;
                H[2] = H[2] + c | 0;
                H[3] = H[3] + d | 0;
                H[4] = H[4] + e | 0;
                H[5] = H[5] + f | 0;
                H[6] = H[6] + g | 0;
                H[7] = H[7] + h | 0;
            },
            _doFinalize: function() {
                // Shortcuts
                var data = this._data;
                var dataWords = data.words;
                var nBitsTotal = this._nDataBytes * 8;
                var nBitsLeft = data.sigBytes * 8;
                // Add padding
                dataWords[nBitsLeft >>> 5] |= 0x80 << 24 - nBitsLeft % 32;
                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math1.floor(nBitsTotal / 0x100000000);
                dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
                data.sigBytes = dataWords.length * 4;
                // Hash final blocks
                this._process();
                // Return final computed hash
                return this._hash;
            },
            clone: function() {
                var clone = Hasher.clone.call(this);
                clone._hash = this._hash.clone();
                return clone;
            }
        });
        /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.SHA256('message');
	     *     var hash = CryptoJS.SHA256(wordArray);
	     */ C.SHA256 = Hasher._createHelper(SHA256);
        /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacSHA256(message, key);
	     */ C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    })(Math);
    return CryptoJS.SHA256;
});
}),
"553": (function (__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {
"use strict";
/* harmony import */var _setup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("198");

// 标记是否已经初始化
let isInitialized = false;
// 默认配置
const defaultConfig = {
    apiMatcher: "/api"
};
// 动态处理函数变量
let handleFetchEventImpl = null;
// 在初始化阶段就注册 fetch 事件监听器
self.addEventListener("fetch", function(event) {
    // 如果没有初始化或没有处理函数，直接返回（不拦截）
    if (!isInitialized || !handleFetchEventImpl) return;
    const response = handleFetchEventImpl(event);
    if (response) return event.respondWith(response);
    return;
});
// 监听来自主线程的消息
self.addEventListener("message", (event)=>{
    console.log("prefetch-worker: received message", event.data);
    if (event.data && event.data.type === "PREFETCH_INIT") try {
        if (isInitialized) {
            console.log("prefetch-worker: already initialized, sending success response");
            // 发送已初始化成功的消息回主线程
            if (event.source) event.source.postMessage({
                type: "PREFETCH_INIT_SUCCESS",
                config: {
                    ...defaultConfig,
                    ...event.data.config
                },
                message: "Already initialized"
            });
            return;
        }
        const config = {
            ...defaultConfig,
            ...event.data.config
        };
        console.log("prefetch-worker: initializing with config", config);
        // 将字符串转换为正则表达式
        const apiMatcher = typeof config.apiMatcher === "string" ? new RegExp(config.apiMatcher) : config.apiMatcher;
        // 调用 setupWorker 并获取处理函数
        handleFetchEventImpl = (0, _setup__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */.ZP)({
            apiMatcher,
            ...config
        });
        isInitialized = true;
        console.log("prefetch-worker: initialization completed");
        // 发送初始化完成的消息回主线程
        if (event.source) event.source.postMessage({
            type: "PREFETCH_INIT_SUCCESS",
            config: config
        });
    } catch (error) {
        console.error("prefetch-worker: initialization failed", error);
        // 发送初始化失败的消息回主线程
        if (event.source) event.source.postMessage({
            type: "PREFETCH_INIT_ERROR",
            error: error instanceof Error ? error.message : String(error)
        });
        self.registration.unregister();
    }
});
// 如果没有收到初始化消息，使用默认配置自动初始化
self.addEventListener("install", ()=>{
    console.log("prefetch-worker: install event");
    // 延迟一下，给主线程发送初始化消息的机会
    setTimeout(()=>{
        if (!isInitialized) {
            console.log("prefetch-worker: auto-initializing with default config");
            try {
                const apiMatcher = new RegExp(defaultConfig.apiMatcher);
                handleFetchEventImpl = (0, _setup__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */.ZP)({
                    apiMatcher
                });
                isInitialized = true;
                console.log("prefetch-worker: auto-initialization completed");
            } catch (error) {
                console.error("prefetch-worker: auto-initialization failed", error);
                self.registration.unregister();
            }
        }
    }, 1000);
});
// 1秒延迟
console.log("prefetch-worker: loaded, waiting for initialization message");
}),
"198": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.d(__webpack_exports__, {
  ZP: function() { return setupWorker; }
});
/* harmony import */var utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("88");
/* harmony import */var _utils_requestToKey__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("21");


const HeadName = "X-Prefetch-Request-Type";
const HeadValue = "prefetch";
const ExpireTimeHeadName = "X-Prefetch-Expire-Time";
// 通过Url匹配是否是需要缓存的请求，匹配中的请求才有可能被缓存，是否缓存取决于请求头
// 缓存的最大数量
// 默认的失效时间，单位毫秒, 默认为0
// 是否允许跨域, 默认为false
// 是否自动跳过等待，默认为true
// 最大缓存数量, 默认为 100
self.addEventListener("install", (event)=>{
    console.log("prefetch: install");
    self.skipWaiting();
});
self.addEventListener("activate", (event)=>{
    // 激活阶段：清除旧缓存，并立即控制客户端
    console.log("prefetch: activate");
    event.waitUntil(self.clients.claim().then(()=>{
        console.log("Service Worker activated and now controls the clients.");
    }));
});
// 用于标记是否已经初始化
const setupSymbol = Symbol("setuped");
function setupWorker(props) {
    console.log("prefetch setupWorker");
    if (self._setuped === setupSymbol) // 如果已经设置过，返回现有的处理函数
    throw new Error("Worker already setup");
    self._setuped = setupSymbol;
    const preRequestCache = new Map();
    let cachedNums = 0;
    const { apiMatcher, requestToKey = _utils_requestToKey__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */.Z, defaultExpireTime = 0, maxCacheSize = 100, debug = false } = props;
    if (debug) self.debug = debug;
    const logger = (0, utils_log__WEBPACK_IMPORTED_MODULE_1__/* .createLogger */.h)(debug);
    logger.info("prefetch: setupWorker", {
        apiMatcher,
        requestToKey,
        defaultExpireTime,
        maxCacheSize
    });
    console.log("prefetch: setupWorker complete");
    // 创建处理函数
    const fetchHandler = (event)=>{
        try {
            var _request_method_toLowerCase, _request_method;
            const request = event.request;
            // Skip cross-origin requests, like those for Google Analytics.
            if (request.mode === "navigate") return;
            // Opening the DevTools triggers the "only-if-cached" request
            // that cannot be handled by the worker. Bypass such requests.
            if (request.cache === "only-if-cached" && request.mode !== "same-origin") return;
            const url = request === null || request === void 0 ? void 0 : request.url;
            const method = request === null || request === void 0 ? void 0 : (_request_method = request.method) === null || _request_method === void 0 ? void 0 : (_request_method_toLowerCase = _request_method.toLowerCase) === null || _request_method_toLowerCase === void 0 ? void 0 : _request_method_toLowerCase.call(_request_method);
            const isApiMetod = [
                "get",
                "post",
                "patch"
            ].includes(method);
            const isApi = (url === null || url === void 0 ? void 0 : url.match(apiMatcher)) || isApiMetod;
            if (!url || !isApi) return;
            return handleFetchEvent(event);
        } catch (error) {
            logger.error("fetch error", error);
            return;
        }
    };
    async function handleFetchEvent(event) {
        try {
            var _request_method_toLowerCase, _request_method;
            const request = event.request.clone();
            const headers = request.headers;
            const method = (_request_method = request.method) === null || _request_method === void 0 ? void 0 : (_request_method_toLowerCase = _request_method.toLowerCase) === null || _request_method_toLowerCase === void 0 ? void 0 : _request_method_toLowerCase.call(_request_method);
            const isPreRequest = headers.get(HeadName) === HeadValue;
            const expireTime = Number(headers.get(ExpireTimeHeadName)) || defaultExpireTime;
            // DELETE 方法不进行缓存，直接透传
            if (method === "delete") {
                logger.info("prefetch: DELETE method, bypass cache", request.url);
                return fetch(event.request);
            }
            const cacheKey = await requestToKey(request.clone());
            logger.info("prefetch: cacheKey", request.url, cacheKey);
            if (!cacheKey) return fetch(event.request);
            const cache = preRequestCache.get(cacheKey);
            // 检查是否有有效的缓存（不管是预请求还是普通请求）
            if (cache && cache.expire > Date.now()) {
                // 如果有完成的响应，直接返回
                if (cache.response) {
                    logger.info("prefetch: cache hit (response)", request.url);
                    return cache.response.clone();
                }
                // 如果有正在进行的请求，等待并复用
                if (cache.requestPromise) {
                    logger.info("prefetch: cache hit (promise)", request.url);
                    try {
                        const response = await cache.requestPromise;
                        logger.info("prefetch: cache hit (promise) success", request.url);
                        cache.requestPromise = undefined;
                        return response.clone();
                    } catch (error) {
                        // 如果正在进行的请求失败，清除缓存并重新发起请求
                        preRequestCache.delete(cacheKey);
                        cachedNums--;
                        logger.error("prefetch: cached promise failed", error);
                        return fetch(event.request.clone());
                    }
                }
            } else if (cache && cache.expire <= Date.now()) {
                // 缓存过期，清除
                preRequestCache.delete(cacheKey);
                cachedNums--;
            }
            // 创建新的请求
            const fetchPromise = fetch(request.clone());
            // 如果缓存中没有这个请求或请求已过期，创建新的缓存项
            if (!cache || cache.expire <= Date.now()) {
                const newExpireTime = isPreRequest && expireTime ? expireTime : defaultExpireTime;
                if (newExpireTime > 0) {
                    logger.info("prefetch: creating new cache entry", request.url);
                    clearCacheWhenOversize();
                    // 创建带有 requestPromise 的缓存项，以便其他并发请求可以复用
                    preRequestCache.set(cacheKey, {
                        expire: Date.now() + newExpireTime,
                        requestPromise: fetchPromise.then((response)=>{
                            // 请求成功后，更新缓存为 response
                            if (response.status === 200) {
                                const existingCache = preRequestCache.get(cacheKey);
                                if (existingCache && existingCache.expire > Date.now()) preRequestCache.set(cacheKey, {
                                    expire: existingCache.expire,
                                    response: response.clone()
                                });
                            }
                            return response;
                        }).catch((error)=>{
                            // 请求失败，清除缓存
                            preRequestCache.delete(cacheKey);
                            cachedNums--;
                            throw error;
                        })
                    });
                    cachedNums++;
                }
            }
            // 等待请求完成并返回响应
            try {
                const response = await fetchPromise;
                logger.info("prefetch: response received", response.status, request.url);
                return response;
            } catch (error) {
                logger.error("prefetch: fetch failed", error);
                throw error;
            }
        } catch (error) {
            logger.error("prefetch: error", error);
            return fetch(event.request);
        }
    }
    function clearCacheWhenOversize() {
        if (cachedNums <= maxCacheSize) return;
        logger.info("clearCache");
        preRequestCache.forEach((cache, key)=>{
            if (cache && cache.expire < Date.now()) {
                preRequestCache.delete(key);
                cachedNums--;
            }
        });
    }
    // 返回处理函数
    return fetchHandler;
}
}),
"88": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.d(__webpack_exports__, {
  h: function() { return createLogger; }
});
const noop = ()=>{};
const createLogger = function() {
    let debug = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    return {
        info: debug ? console.log : noop,
        warn: debug ? console.warn : noop,
        error: debug ? console.error : noop
    };
};
}),
"21": (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
"use strict";
__webpack_require__.d(__webpack_exports__, {
  Z: function() { return requestToKey; }
});
/* harmony import */var crypto_js_sha256__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("970");
/* harmony import */var crypto_js_sha256__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto_js_sha256__WEBPACK_IMPORTED_MODULE_0__);

async function requestToKey(_request) {
    const request = _request.clone();
    const url = request.url;
    const method = request.method;
    const body = await request.text();
    // 组合信息
    const combinedInfo = `${method.toUpperCase()} ${url} ${JSON.stringify(body)}`;
    // 使用btoa函数进行编码生成唯一键
    // 注意：在实际应用中，可能需要使用更安全的哈希函数如SHA-256
    const key = crypto_js_sha256__WEBPACK_IMPORTED_MODULE_0___default()(combinedInfo).toString();
    return key;
}
}),
"532": (function () {
/* (ignored) */}),

}
// The module cache
 var __webpack_module_cache__ = {};
function __webpack_require__(moduleId) {
// Check if module is in cache
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
      return cachedModule.exports;
      }
      // Create a new module (and put it into the cache)
      var module = (__webpack_module_cache__[moduleId] = {
       exports: {}
      });
      // Execute the module function
      __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
// Return the exports of the module
 return module.exports;

}
// webpack/runtime/compat_get_default_export
!function() {
// getDefaultExport function for compatibility with non-harmony modules
__webpack_require__.n = function (module) {
	var getter = module && module.__esModule ?
		function () { return module['default']; } :
		function () { return module; };
	__webpack_require__.d(getter, { a: getter });
	return getter;
};




}();
// webpack/runtime/define_property_getters
!function() {
__webpack_require__.d = function(exports, definition) {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
}();
// webpack/runtime/global
!function() {
__webpack_require__.g = (function () {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();

}();
// webpack/runtime/has_own_property
!function() {
__webpack_require__.o = function (obj, prop) {
	return Object.prototype.hasOwnProperty.call(obj, prop);
};

}();
var __webpack_exports__ = __webpack_require__("553");
})()
