
import { LEN, isPathValid } from "./MerkleBST";
import { Field } from "o1js";

describe('MerkleBST.isPathValid tests', () => {
  const f = (...a: number[]) => a.map(Field).concat(Array(LEN - a.length).fill(Field(0)));

  it('should accept valid paths', () => {
    expect(isPathValid(f())).toBeTruthy();
    expect(isPathValid(f(100))).toBeTruthy();
    expect(isPathValid(f(100, 150))).toBeTruthy();
    expect(isPathValid(f(100, 150, 125, 110, 101))).toBeTruthy();
    expect(isPathValid(f(100, 80, 90, 95, 98, 97, 96))).toBeTruthy();
  });

  it('should reject invalid paths', () => {
    expect(() => isPathValid(f(50, 50))).toThrow();
    expect(() => isPathValid(f(100, 150, 90))).toThrow();
    expect(() => isPathValid(f(100, 150, 200, 140))).toThrow();
    expect(() => isPathValid(f(100, 99, 101))).toThrow();
    expect(() => isPathValid(f(100, 80, 90, 95, 98, 97, 96, 95))).toThrow();
    expect(() => isPathValid(f(100, 101, 102, 103, 104, 105, 106, 106))).toThrow();
  })

  it('should insert the penultimate, but fail after', () => {
    expect(isPathValid(f(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)));
    expect(() => isPathValid(f(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10))).toThrow();
    expect(() => isPathValid(f(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9))).toThrow();
    expect(() => isPathValid(f(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 8))).toThrow();
  })
});
