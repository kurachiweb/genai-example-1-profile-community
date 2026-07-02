// ページヘッダー(タイトル＋説明文)。各ページの上部に統一的に配置する。
interface Props {
	readonly title: string;
	readonly description?: string;
	readonly actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: Props) {
	return (
		<div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 className="text-(length:--text-heading) font-bold text-text">{title}</h1>
				{description ? (
					<p className="mt-1 text-(length:--text-body) text-text-muted">{description}</p>
				) : null}
			</div>
			{actions ? <div className="mt-2 sm:mt-0">{actions}</div> : null}
		</div>
	);
}
