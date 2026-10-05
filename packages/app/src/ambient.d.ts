/// <reference types="temporal-spec/global" />

declare namespace Intl {
  interface DurationFormatOptions {
    days?: 'always' | 'auto' | 'long' | 'narrow' | 'short';
    fractionalDigits?: number;
    hours?: '2-digit' | 'always' | 'auto' | 'long' | 'narrow' | 'numeric' | 'short';
    minutes?: '2-digit' | 'always' | 'auto' | 'long' | 'narrow' | 'numeric' | 'short';
    months?: 'always' | 'auto' | 'long' | 'narrow' | 'short';
    seconds?: '2-digit' | 'always' | 'auto' | 'long' | 'narrow' | 'numeric' | 'short';
    style?: 'digital' | 'long' | 'narrow' | 'short';
    weeks?: 'always' | 'auto' | 'long' | 'narrow' | 'short';
    years?: 'always' | 'auto' | 'long' | 'narrow' | 'short';
  }

  interface DurationInput {
    days?: number;
    hours?: number;
    microseconds?: number;
    milliseconds?: number;
    minutes?: number;
    months?: number;
    nanoseconds?: number;
    seconds?: number;
    weeks?: number;
    years?: number;
  }

  class DurationFormat {
    constructor(locales?: string | string[], options?: DurationFormatOptions);
    format(duration: DurationInput): string;
  }
}
