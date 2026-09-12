"use client";

import { deleteInvite } from "@/app/admin/actions";

export function DeleteInviteButton({ inviteId }: { inviteId: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Excluir este convite permanentemente?")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteInvite} onSubmit={handleSubmit}>
      <input type="hidden" name="inviteId" value={inviteId} />
      <button
        type="submit"
        className="rounded-full border border-red-500/30 px-3.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
      >
        Excluir
      </button>
    </form>
  );
}
