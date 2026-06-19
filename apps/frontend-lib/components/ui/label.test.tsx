import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

describe('Label', () => {
	test('htmlFor で入力と関連付く', () => {
		render(
			<>
				<Label htmlFor="email">メールアドレス</Label>
				<Input id="email" />
			</>
		);

		// ラベルクリックで対応する入力にフォーカスが向く関連付けを、アクセシブル名で確認する。
		expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
	});

	test('required で視覚マーカーを添える', () => {
		render(
			<Label htmlFor="name" required>
				氏名
			</Label>
		);

		expect(screen.getByText('氏名')).toBeInTheDocument();
		// アスタリスクは aria-hidden（装飾）。必須は別途 input 側 required で支援技術へ伝える。
		expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
	});
});
