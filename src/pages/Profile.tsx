import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeals } from "@/context/DealsContext";
import { getCurrentUser, uploadAvatar, upsertProfile, supabase, ensureProfileForUser, countDealsByOwner } from "@/lib/supabaseApi";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import UserAvatar from "@/components/UserAvatar";

export default function Profile() {
  const { deals } = useDeals();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dbCount, setDbCount] = useState<number | null>(null);

  useEffect(() => {
    getCurrentUser().then(async (u) => {
      setUser(u);
      const meta = (u as any)?.user_metadata || {};
      setEmail(u?.email || "");
      setName(meta.full_name || meta.name || "");
      const pic = meta.avatar_url || meta.picture || null;
      if (pic) setAvatar(pic);
      // Ensure a profile row exists (avoids empty fetches/loops)
      if (isSupabaseConfigured && u?.id) {
        try { await ensureProfileForUser(u); } catch {}
        try { const c = await countDealsByOwner(u.id); setDbCount(c); } catch {}
      }
    });
  }, []);

  const myCount = useMemo(() => {
    const uid = user?.id;
    if (!uid) return 0;
    return deals.filter((d) => d.ownerId === uid).length;
  }, [deals, user]);

  const pickAvatar = () => fileRef.current?.click();

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || !user?.id) return;
    setSaving(true);
    try {
      const publicUrl = await uploadAvatar(f);
      setAvatar(publicUrl);
      await upsertProfile({ id: user.id, avatar_url: publicUrl });
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } } as any);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await upsertProfile({ id: user.id, full_name: name, avatar_url: avatar || undefined });
      await supabase.auth.updateUser({ data: { full_name: name } } as any);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try { await supabase.auth.signOut(); } catch {}
    window.location.href = "/login";
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <UserAvatar user={user} src={avatar || undefined} size="xl" />
                <Button size="sm" variant="outline" onClick={pickAvatar} disabled={saving}>Changer la photo</Button>
                <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleAvatar} />
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <Label>Nom complet</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={email} readOnly />
                </div>
                <div className="text-sm text-muted-foreground">Publications: {dbCount ?? myCount}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveProfile} disabled={saving}>Enregistrer</Button>
                <Button variant="outline" onClick={logout}>Se déconnecter</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
