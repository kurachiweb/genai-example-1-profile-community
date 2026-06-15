// SNS/Web リンクのドメインルール(BR-PROF-007)。
// 種別の列挙・https のみ・件数/長さの上限を検証する。検証は境界で行い、DB は最終防衛線。
import { FieldError, ValidationError } from './errors';
import { countGraphemes } from './grapheme';
import { SNS_LABEL_MAX_GRAPHEMES, SNS_LINKS_MAX_COUNT, SNS_URL_MAX_LENGTH } from './limits';
import { normalizeText } from './text';

export const SnsPlatform = {
  X: 'x',
  GITHUB: 'github',
  LINKEDIN: 'linkedin',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  FACEBOOK: 'facebook',
  TIKTOK: 'tiktok',
  WEBSITE: 'website',
} as const;

export type SnsPlatform = (typeof SnsPlatform)[keyof typeof SnsPlatform];

const SNS_PLATFORM_VALUES: ReadonlySet<string> = new Set(Object.values(SnsPlatform));

export function isSnsPlatform(value: string): value is SnsPlatform {
  return SNS_PLATFORM_VALUES.has(value);
}

export interface SnsLinkInput {
  readonly platform: string;
  readonly url: string;
  readonly label?: string | null;
}

export interface NormalizedSnsLink {
  readonly platform: SnsPlatform;
  readonly url: string;
  readonly label: string | null;
  readonly sortOrder: number;
}

function isHttpsUrl(value: string): boolean {
  // https のみ許可(平文 HTTP・javascript: 等の危険スキームを排除、BR-PROF-007/008)。
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return parsed.protocol === 'https:';
}

/**
 * SNS リンク配列を検証・正規化する。入力順を表示順(sortOrder)として確定する。
 * @throws ValidationError 件数超過・種別不正・非 https・長さ超過のとき(field=snsLinks[index].xxx)。
 */
export function validateSnsLinks(links: readonly SnsLinkInput[]): NormalizedSnsLink[] {
  const details: FieldError[] = [];

  if (links.length > SNS_LINKS_MAX_COUNT) {
    details.push({
      field: 'snsLinks',
      message: `SNS リンクは最大 ${SNS_LINKS_MAX_COUNT} 件までです。`,
    });
  }

  const normalized: NormalizedSnsLink[] = [];
  links.forEach((link, index) => {
    const url = link.url.trim();
    const label = link.label == null ? null : normalizeText(link.label);

    if (!isSnsPlatform(link.platform)) {
      details.push({ field: `snsLinks[${index}].platform`, message: '種別が不正です。' });
    }
    if (url.length === 0 || url.length > SNS_URL_MAX_LENGTH || !isHttpsUrl(url)) {
      details.push({
        field: `snsLinks[${index}].url`,
        message: `URL は https:// のみ・最大 ${SNS_URL_MAX_LENGTH} 文字で指定してください。`,
      });
    }
    if (label != null && countGraphemes(label) > SNS_LABEL_MAX_GRAPHEMES) {
      details.push({
        field: `snsLinks[${index}].label`,
        message: `ラベルは最大 ${SNS_LABEL_MAX_GRAPHEMES} 文字です。`,
      });
    }

    normalized.push({
      platform: link.platform as SnsPlatform,
      url,
      label: label && label.length > 0 ? label : null,
      sortOrder: index,
    });
  });

  if (details.length > 0) {
    throw new ValidationError('SNS リンクの入力に誤りがあります。', details);
  }
  return normalized;
}
