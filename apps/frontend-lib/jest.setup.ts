// Jest セットアップ。RTL の DOM マッチャと jest-axe のアクセシビリティマッチャを有効化する。
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);
