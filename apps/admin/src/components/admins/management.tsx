// 管理者アカウント・権限管理の操作(クライアント)。super_admin のみが MANAGE_ADMINS を行える(api で強制)。
// ロックアウト防止(最後の super_admin・自己降格)は api がブロックし、ダイアログにエラーを表示する(AC-ADMIN-003)。
'use client';

import { useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { Button, Input, Label } from '@app/frontend-lib';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { changeRoleAction, createAdminAction, disableAdminAction } from '@/lib/actions';

const ROLE_OPTIONS: ReadonlyArray<readonly [string, string]> = [
	['moderator', 'モデレーター'],
	['support', 'サポート'],
	['viewer', '閲覧のみ'],
	['super_admin', 'スーパー管理者']
];

function RoleSelect({
	name,
	value,
	onChange,
	id
}: {
	name?: string;
	value: string;
	onChange?: (value: string) => void;
	id?: string;
}) {
	return (
		<select
			id={id}
			name={name}
			value={value}
			onChange={(event) => onChange?.(event.target.value)}
			className="h-10 rounded-md border border-border bg-surface-raised px-3 text-[length:var(--text-meta)] text-text"
		>
			{ROLE_OPTIONS.map(([v, label]) => (
				<option key={v} value={v}>
					{label}
				</option>
			))}
		</select>
	);
}

export function CreateAdminForm() {
	const [pending, startTransition] = useTransition();
	const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
	const [role, setRole] = useState('moderator');

	function onSubmit(formData: FormData) {
		startTransition(async () => {
			const result = await createAdminAction({
				email: String(formData.get('email') ?? ''),
				password: String(formData.get('password') ?? ''),
				role
			});
			setMessage(
				result.ok
					? { ok: true, text: '管理者を追加しました。' }
					: { ok: false, text: result.error ?? '追加に失敗しました。' }
			);
		});
	}

	return (
		<form action={onSubmit} className="flex flex-wrap items-end gap-3">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="new-email" required>
					メールアドレス
				</Label>
				<Input id="new-email" name="email" type="email" required className="w-60" />
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="new-password" required>
					初期パスワード
				</Label>
				<Input id="new-password" name="password" type="password" required className="w-52" />
			</div>
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="new-role">ロール</Label>
				<RoleSelect id="new-role" value={role} onChange={setRole} />
			</div>
			<Button type="submit" disabled={pending}>
				<UserPlus className="size-4" aria-hidden="true" />
				{pending ? '追加中…' : '管理者を追加'}
			</Button>
			{message ? (
				<p
					role="status"
					className={
						message.ok
							? 'text-[length:var(--text-meta)] text-success'
							: 'text-[length:var(--text-meta)] text-danger'
					}
				>
					{message.text}
				</p>
			) : null}
		</form>
	);
}

export function RoleChangeButton({
	adminId,
	currentRole
}: {
	adminId: string;
	currentRole: string;
}) {
	const [role, setRole] = useState(currentRole);
	return (
		<ConfirmDialog
			triggerLabel="権限変更"
			triggerVariant="outline"
			triggerSize="sm"
			title="ロールを変更しますか？"
			description="最後のスーパー管理者の降格や自己の権限剥奪はロックアウト防止のため拒否されます。"
			confirmLabel="変更する"
			onConfirm={() => changeRoleAction(adminId, role)}
		>
			<Label htmlFor={`role-${adminId}`}>新しいロール</Label>
			<div className="mt-1.5">
				<RoleSelect id={`role-${adminId}`} value={role} onChange={setRole} />
			</div>
		</ConfirmDialog>
	);
}

export function DisableAdminButton({ adminId }: { adminId: string }) {
	return (
		<ConfirmDialog
			triggerLabel="無効化"
			triggerVariant="danger"
			triggerSize="sm"
			title="この管理者を無効化しますか？"
			description="無効化するとログインできなくなります。"
			confirmLabel="無効化する"
			confirmVariant="danger"
			onConfirm={() => disableAdminAction(adminId)}
		/>
	);
}
