drop index `uq_users_email_normalized`;
create unique index `uq_users_email_normalized` on `users` (`email_normalized`) where status <> 'WITHDRAWN';
