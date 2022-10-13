// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const DEFAULT_DIGIT_LIMIT = 11;

const DoubleNumberErrors = {
  NOT_VALID: {
    CODE: "doubleNumber.e001",
    MESSAGE: "The value is not a valid decimal number.",
  },
  EXCEEDED_MAX_NUMBER_OF_DIGITS: {
    CODE: "doubleNumber.e002",
    MESSAGE: "The value exceeded maximum number of digits.",
  },
  EXCEEDED_MAX_NUMBER_OF_DECIMAL_PLACES: {
    CODE: "doubleNumber.e003",
    MESSAGE: "The value exceeded maximum number of decimal places.",
  }
}

/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  match(value) {
    let result = new ValidationResult();

    if (value != null) {

      if (this.validateParamsLength(0)) {
        return this.processNoParamInput(value, result);
      }

      if (this.validateParamsLength(1)) {
        return this.processOneParamInput(value, result);
      }

      if (this.validateParamsLength(2)) {
        return this.processTwoParamsInput(value, result);
      }
    }
  }

  processNoParamInput(value, result) {
    let number = this.convertToDecimal(value, result);
    this.validateMaxNumberOfDigits(number, DEFAULT_DIGIT_LIMIT, result);

    return result;
  }

  processOneParamInput(value, result) {
    let number = this.convertToDecimal(value, result);
    this.validateMaxNumberOfDigits(number, this.params[0], result);

    return result;
  }

  processTwoParamsInput(value, result) {
    let number = this.convertToDecimal(value, result);
    this.validateMaxNumberOfDigits(number, this.params[0], result);
    this.validateMaxNumberOfDecimalPlaces(number, result);

    return result;
  }

  convertToDecimal(value, result) {
    let number;
    try {
      number = new Decimal(value);
    } catch (e) {
      number = null;
      result.addInvalidTypeError(DoubleNumberErrors.NOT_VALID.CODE, DoubleNumberErrors.NOT_VALID.MESSAGE);
    }
    return number;
  }

  validateMaxNumberOfDigits(number, maxNumberOfDigits, result) {
    if (this.isExceededMaxNumberOfDigits(number, maxNumberOfDigits)) {
      result.addInvalidTypeError(DoubleNumberErrors.EXCEEDED_MAX_NUMBER_OF_DIGITS.CODE, DoubleNumberErrors.EXCEEDED_MAX_NUMBER_OF_DIGITS.MESSAGE);
    }
  }

  validateMaxNumberOfDecimalPlaces(number, result) {
    if (this.isExceededMaxNumberOfDecimalPlaces(number)) {
      result.addInvalidTypeError(DoubleNumberErrors.EXCEEDED_MAX_NUMBER_OF_DECIMAL_PLACES.CODE, DoubleNumberErrors.EXCEEDED_MAX_NUMBER_OF_DECIMAL_PLACES.MESSAGE);
    }
  }

  validateParamsLength(length) {
    return this.params.length === length;
  }

  isExceededMaxNumberOfDecimalPlaces(number) {
    return number?.decimalPlaces() > this.params[1];
  }

  isExceededMaxNumberOfDigits(number, maxNumberOfDigits) {
    return number?.precision(true) > maxNumberOfDigits;
  }
}

module.exports = DecimalNumberMatcher;
