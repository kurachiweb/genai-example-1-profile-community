// ドメイン例外 → GraphQL エラー(extensions.code)への対称写像(api/00-overview.md §2.4・coding/04-nestjs.md §4.4)。
// コード語彙は公開 REST(BR-API-011)と一致。想定外の内部エラーはコードを一般化し詳細はログのみ(BR-COMMON-012/014)。
import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainError } from '../../domain/errors';

@Catch(DomainError)
export class DomainErrorFilter implements GqlExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): GraphQLError {
    // GraphQL 実行コンテキストであることを明示(将来 HTTP 面と共用する場合の分岐点)。
    GqlArgumentsHost.create(host);
    return new GraphQLError(exception.message, {
      extensions: {
        code: exception.code,
        httpStatus: exception.httpStatus,
        details: exception.details ?? null,
      },
    });
  }
}
