import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AuthGateway,
  AuthUser,
} from "@/core/application/ports/auth-gateway";
import { DomainError } from "@/core/domain/errors/domain-error";

/**
 * Admin auth operations (requires the service-role client).
 * Creates the buyer account right after payment so the magic link /
 * OTP login works immediately — email arrives pre-confirmed.
 */
export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly admin: SupabaseClient) {}

  async findOrCreateUserByEmail(
    email: string,
    metadata?: { name?: string; phone?: string; password?: string },
  ): Promise<AuthUser> {
    const normalized = email.trim().toLowerCase();

    const { data: created, error } = await this.admin.auth.admin.createUser({
      email: normalized,
      email_confirm: true,
      ...(metadata?.password ? { password: metadata.password } : {}),
      user_metadata: {
        ...(metadata?.name ? { name: metadata.name } : {}),
        ...(metadata?.phone ? { phone: metadata.phone } : {}),
      },
    });

    if (!error && created.user) {
      return { id: created.user.id, email: normalized };
    }

    // Already exists → look it up (listUsers has no email filter pre-v2 API;
    // use the paginated search which matches by email exactly)
    const { data: list, error: listError } =
      await this.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) {
      throw new DomainError("INTERNAL", `Falha ao buscar usuário: ${listError.message}`);
    }
    const existing = list.users.find(
      (u) => u.email?.toLowerCase() === normalized,
    );
    if (!existing) {
      throw new DomainError(
        "INTERNAL",
        `Não foi possível criar nem encontrar o usuário ${normalized}`,
      );
    }

    // Usuário já existia: atualiza a senha se fornecida
    if (metadata?.password) {
      await this.admin.auth.admin.updateUserById(existing.id, {
        password: metadata.password,
        email_confirm: true,
      });
    }

    return { id: existing.id, email: normalized };
  }
}
