// 公開プロフィールの ViewModel(Interface Adapters / Presenter 出力、api/02 §5)。
// 返却するのは公開可能なフィールドのみ。内部 ID(profile.id/userId)・メール等の非公開属性は含めない
// (BR-API-005)。OpenAPI スキーマ用に @ApiProperty で構造のみ記述する(値の正本は features/、§9)。
import { ApiProperty } from '@nestjs/swagger';

export class SnsLinkView {
	@ApiProperty({ description: 'SNS 種別(x/github/website 等。値の正本は BR-PROF-007)' })
	platform!: string;

	@ApiProperty({ description: 'https:// の URL' })
	url!: string;

	@ApiProperty({ description: '表示ラベル(website 用、任意)', nullable: true })
	label!: string | null;

	@ApiProperty({ description: '表示順(0 始まり)' })
	sortOrder!: number;
}

export class ProfileView {
	@ApiProperty({ description: '公開ハンドル(3〜30・小文字、BR-SHARE-001)' })
	handle!: string;

	@ApiProperty({ description: '表示名(氏名と表示順から導出、BR-PROF-003/004)' })
	displayName!: string;

	@ApiProperty({ description: '名(ファーストネーム)' })
	firstName!: string;

	@ApiProperty({ description: '姓(ラストネーム)' })
	lastName!: string;

	@ApiProperty({ description: '氏名の表示順(givenNameFirst/familyNameFirst)' })
	nameDisplayOrder!: string;

	@ApiProperty({ description: '職業・職種(任意、BR-PROF-005)', nullable: true })
	occupation!: string | null;

	@ApiProperty({ description: '自己紹介(任意・プレーンテキスト、BR-PROF-006)', nullable: true })
	bio!: string | null;

	@ApiProperty({ description: 'アイコン画像 ID(Cloudflare Images、未設定は既定)', nullable: true })
	iconImageId!: string | null;

	@ApiProperty({ description: '公開設定(PUBLIC/PRIVATE、BR-SHARE-005)' })
	visibility!: string;

	@ApiProperty({ type: () => [SnsLinkView], description: 'SNS/Web リンク(0〜10 件)' })
	snsLinks!: SnsLinkView[];

	@ApiProperty({ description: '作成日時(UTC・ISO-8601)' })
	createdAt!: string;

	@ApiProperty({ description: '更新日時(UTC・ISO-8601)' })
	updatedAt!: string;
}
