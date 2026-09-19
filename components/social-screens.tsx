"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import { PlanStatus, LockedFeature } from "./subscription-ui";
import { NetworkSections, PlayHomeCard } from "./event-navigation";
import { ProfileLayout, Modal } from "./profile-screens";
import { Submit } from "./studio-ui";
import { displayName, photos, sports } from "@/lib/model";
import {
  members,
  opportunities,
  matchesQuery,
  canReceive,
  visibleComments,
  visibleMessages,
  commentReason,
  type Member,
  type Opportunity,
} from "@/lib/social";

function Chips({
  values,
  value,
  onChange,
  label,
}: {
  values: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="sport-filters" role="group" aria-label={label}>
      {values.map((v) => (
        <Button
          type="button"
          variant="ghost"
          key={v}
          aria-pressed={v === value}
          onClick={() => onChange(v)}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}
function SearchField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="social-search">
      <Search size={18} aria-hidden="true" />
      <Input
        type="search"
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="social-empty">
      <Search size={26} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
function SportSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (s: string) => void;
  id: string;
}) {
  return (
    <div className="compact-select">
      <SlidersHorizontal size={16} aria-hidden="true" />
      <label htmlFor={id}>Sport</label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <NativeSelectOption value="Tous">Tous les sports</NativeSelectOption>
        {sports.map((s) => (
          <NativeSelectOption key={s} value={s}>
            {s}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}

export function FeedPage() {
  const { profile, social, dispatchSocial, notify, requestAccess, access } = useDemo();
  const [sport, setSport] = useState("Tous");
  const [compose, setCompose] = useState(false);
  const [postSport, setPostSport] = useState(profile.sport);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState("");
  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const posts = social.posts.filter((p) => sport === "Tous" || p.sport === sport);
  const selected = social.posts.find((p) => p.id === commentsId);
  return (
    <ProfileLayout>
      <div className="social-title">
        <div>
          <span className="mini-kicker">VOTRE SPORT. VOTRE RÉSEAU.</span>
          <h1>
            Dans le mouvement<span>.</span>
          </h1>
        </div>
      </div>
      <PlanStatus compact />
      <PlayHomeCard />
      <button
        type="button"
        className="compose-launch"
        onClick={() => {
          if (requestAccess("publish")) setCompose(true);
        }}
      >
        <img src={profile.photo} alt="" />
        <span>
          Quoi de neuf sur votre terrain ?<small>Partager un moment, une idée, une réussite</small>
        </span>
        <Plus size={22} />
      </button>
      <Chips
        label="Filtrer les publications par sport"
        values={["Tous", ...sports]}
        value={sport}
        onChange={setSport}
      />
      <div className="list-caption">
        <span>Le fil de votre communauté</span>
        <span>{posts.length} publications</span>
      </div>
      <p className="demo-context">Profils et publications fictifs · rien n’est publié en ligne.</p>
      <div className="feed-list">
        {posts.map((post) => (
          <article key={post.id} className="post-card">
            <header className="post-author">
              <img src={post.avatar} alt="" />
              <div>
                <h2>{post.author === "self" ? displayName(profile) : post.name}</h2>
                <p>{post.role}</p>
              </div>
              <span className="post-sport">{post.sport}</span>
            </header>
            <p className="post-text">{post.text}</p>
            {post.image && (
              <img
                className="post-image"
                src={post.image}
                alt={"Illustration sportive · " + post.sport}
              />
            )}
            <div className="post-actions">
              <Button
                variant="ghost"
                aria-pressed={post.liked}
                aria-label={post.liked ? "Retirer mon j’aime" : "Aimer la publication"}
                onClick={() => dispatchSocial({ type: "like", id: post.id })}
              >
                <Heart size={18} fill={post.liked ? "currentColor" : "none"} />
                {post.likes}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (post.author === "self" && !requestAccess("receive")) return;
                  setCommentsId(post.id);
                  setComment("");
                }}
              >
                <MessageCircle size={18} />
                {post.author === "self" && !canReceive(social, profile.category)
                  ? "Activer les commentaires"
                  : visibleComments(social, access, post).length || "Commenter"}
              </Button>
              <span>Démo</span>
            </div>
          </article>
        ))}
      </div>
      {!posts.length && (
        <Empty
          title="Le terrain est à vous."
          text="Aucune publication pour cette discipline. Partagez la première publication fictive ou choisissez un autre sport."
        />
      )}
      <Modal
        open={compose}
        onOpenChange={setCompose}
        title="À vous de jouer."
        description="Publication de démonstration, visible uniquement pendant cette visite. N’utilisez pas d’informations personnelles."
      >
        <form
          className="social-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            if (!requestAccess("publish")) return;
            dispatchSocial({
              type: "post",
              post: {
                id: crypto.randomUUID(),
                author: "self",
                name: displayName(profile),
                role: profile.headline,
                avatar: profile.photo,
                sport: postSport,
                text,
                image: photo || undefined,
                likes: 0,
                liked: false,
                comments: [],
              },
            });
            setText("");
            setPhoto("");
            setSport("Tous");
            setCompose(false);
            notify("Publication ajoutée au fil de démonstration uniquement.");
          }}
        >
          <label htmlFor="post-text">Votre publication</label>
          {!canReceive(social, profile.category) && (
            <p className="free-plan-note">
              Vous pouvez publier gratuitement. La réception des commentaires sur votre post sera
              disponible avec Premium.
            </p>
          )}
          <Textarea
            id="post-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Un moment à partager avec la communauté…"
            maxLength={1200}
            required
            rows={5}
          />
          <small className="character-count">{text.length}/1200</small>
          <label htmlFor="post-sport">Discipline</label>
          <NativeSelect
            id="post-sport"
            value={postSport}
            onChange={(e) => setPostSport(e.target.value)}
          >
            {sports.map((s) => (
              <NativeSelectOption key={s}>{s}</NativeSelectOption>
            ))}
          </NativeSelect>
          <label htmlFor="post-photo">
            <ImagePlus size={16} /> Illustration fournie (facultative)
          </label>
          <NativeSelect id="post-photo" value={photo} onChange={(e) => setPhoto(e.target.value)}>
            <NativeSelectOption value="">Sans image</NativeSelectOption>
            {photos.map((p) => (
              <NativeSelectOption key={p.src} value={p.src}>
                {p.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {photo && <img className="compose-preview" src={photo} alt="Illustration sélectionnée" />}
          <Submit className="action primary" disabled={!text.trim()}>
            Publier dans la démo <ArrowUpRight size={18} />
          </Submit>
        </form>
      </Modal>
      <Modal
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setCommentsId(null);
        }}
        title="La conversation continue."
        description="Commentaires fictifs, conservés uniquement pendant cette visite."
      >
        {selected && (
          <>
            <div className="comments-list">
              {visibleComments(social, access, selected).length ? (
                visibleComments(social, access, selected).map((c) => (
                  <div key={c.id}>
                    <strong>{c.name}</strong>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <p>Soyez le premier à réagir.</p>
              )}
            </div>
            {commentReason(social, access, selected) ? (
              <LockedFeature reason={commentReason(social, access, selected)!} />
            ) : (
              <form
                className="social-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!comment.trim()) return;
                  dispatchSocial({
                    type: "comment",
                    id: selected.id,
                    comment: { id: crypto.randomUUID(), name: displayName(profile), text: comment },
                  });
                  setComment("");
                }}
              >
                <label htmlFor="comment">Votre commentaire</label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={400}
                  required
                />
                <Submit className="action primary" disabled={!comment.trim()}>
                  Commenter dans la démo <Send size={16} />
                </Submit>
              </form>
            )}
          </>
        )}
      </Modal>
    </ProfileLayout>
  );
}

export function NetworkPage() {
  const { social, dispatchSocial, requestAccess } = useDemo();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("Tous");
  const [sport, setSport] = useState("Tous");
  const [onlyFollowed, setOnlyFollowed] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const filtered = members.filter(
    (m) =>
      (kind === "Tous" || m.kind === kind) &&
      (sport === "Tous" || m.sport === sport) &&
      (!onlyFollowed || social.following.includes(m.id)) &&
      matchesQuery([m.name, m.role, m.city, m.sport].join(" "), query),
  );
  function message(m: Member) {
    if (!requestAccess("message", m.id)) return;
    dispatchSocial({ type: "open-chat", id: m.id });
    router.push("/messages");
  }
  return (
    <ProfileLayout>
      <div className="social-title">
        <div>
          <span className="mini-kicker">LES BONNES RENCONTRES</span>
          <h1>
            Votre réseau<span>.</span>
          </h1>
        </div>
        <UsersRound className="title-symbol" size={28} />
      </div>
      <NetworkSections />
      <SearchField value={query} onChange={setQuery} label="Nom, rôle, club ou ville…" />
      <Chips
        label="Types de membres"
        values={["Tous", "Joueurs", "Professionnels", "Collectives"]}
        value={kind}
        onChange={setKind}
      />
      <div className="network-controls">
        <SportSelect id="network-sport" value={sport} onChange={setSport} />
        <Button
          variant="ghost"
          className="followed-filter"
          aria-pressed={onlyFollowed}
          onClick={() => setOnlyFollowed(!onlyFollowed)}
        >
          Suivis · {social.following.length}
        </Button>
      </div>
      <div className="list-caption">
        <span>{onlyFollowed ? "Vous les suivez" : "Des profils à découvrir"}</span>
        <span>{filtered.length} résultats</span>
      </div>
      <p className="demo-context">
        Tous les membres sont fictifs. « Collectives » : clubs, équipes et organisations.
      </p>
      <div className="network-list">
        {filtered.map((m) => (
          <article className="member-card" key={m.id}>
            <button className="member-intro" onClick={() => setMember(m)}>
              <img src={m.image} alt="" />
              <span>
                <small>
                  {m.kind} · {m.sport}
                </small>
                <strong>{m.name}</strong>
                <span>{m.role}</span>
                <span className="member-location">
                  <MapPin size={12} />
                  {m.city}
                </span>
              </span>
              <ArrowUpRight size={17} />
            </button>
            <div className="member-actions">
              <Button
                variant={social.following.includes(m.id) ? "secondary" : "default"}
                aria-pressed={social.following.includes(m.id)}
                onClick={() => dispatchSocial({ type: "follow", id: m.id })}
              >
                {social.following.includes(m.id) ? <Check size={16} /> : <Plus size={16} />}
                {social.following.includes(m.id) ? "Suivi" : "Suivre"}
              </Button>
              <Button variant="outline" onClick={() => message(m)}>
                <MessageCircle size={16} />
                Message
              </Button>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="Aucun profil pour ces critères."
          text="Essayez une autre discipline, un autre type de membre ou une recherche plus courte."
        />
      )}
      <Modal
        open={!!member}
        onOpenChange={(v) => {
          if (!v) setMember(null);
        }}
        title={member?.name || "Profil"}
        description="Profil fictif de démonstration, sans lien avec une personne ou un club réel."
      >
        {member && (
          <div className="member-detail">
            <img src={member.image} alt={"Illustration · " + member.sport} />
            <span className="sport-chip">
              {member.kind} · {member.sport}
            </span>
            <h3>{member.role}</h3>
            <p>{member.city}</p>
            <p>{member.bio}</p>
            <Link className="action secondary" href={`/organiser?invite=${member.id}`}>Inviter à jouer</Link>
            <Button className="action primary" onClick={() => message(member)}>
              Commencer une conversation <MessageCircle size={17} />
            </Button>
          </div>
        )}
      </Modal>
    </ProfileLayout>
  );
}

export function MessagesPage() {
  const { social, dispatchSocial, access, requestAccess } = useDemo();
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [newChat, setNewChat] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const active = social.conversations.find((c) => c.memberId === social.activeChat);
  const member = members.find((m) => m.id === active?.memberId);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
    setText("");
  }, [social.activeChat]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [active?.messages.length]);
  return (
    <ProfileLayout>
      <div className="social-title">
        <div>
          <span className="mini-kicker">LE LIEN COMMENCE ICI</span>
          <h1>
            Messages<span>.</span>
          </h1>
        </div>
        <Button
          variant="secondary"
          className="square-action"
          aria-label="Nouvelle conversation"
          onClick={() => setNewChat(true)}
        >
          <Plus size={22} />
        </Button>
      </div>
      <p className="demo-context">
        Conversations simulées. Aucun message n’est envoyé à une personne réelle.
      </p>
      <PlanStatus compact />
      {!canReceive(social, access.category) && <LockedFeature />}
      {active && member ? (
        <section className="conversation-panel" aria-label={"Conversation avec " + member.name}>
          <header className="conversation-heading">
            <Button
              variant="ghost"
              aria-label="Retour aux conversations"
              onClick={() => dispatchSocial({ type: "close-chat" })}
            >
              <ArrowLeft size={20} />
            </Button>
            <img src={member.image} alt="" />
            <div>
              <h2>{member.name}</h2>
              <p>{member.role}</p>
            </div>
          </header>
          <div
            ref={log}
            className="message-log"
            role="log"
            aria-label="Historique des messages"
            aria-live="polite"
          >
            <span className="chat-date">CONVERSATION DE DÉMONSTRATION</span>
            {!active.messages.length && (
              <p className="chat-empty">Commencez l’échange avec un message fictif.</p>
            )}
            {visibleMessages(social, access, active).map((m) => (
              <div key={m.id} className={m.mine ? "message-bubble mine" : "message-bubble"}>
                <span className="sr-only">{m.mine ? "Vous" : member.name} : </span>
                <p>{m.text}</p>
                <small>{m.mine ? "Ajouté à la démo" : "Exemple de message"}</small>
              </div>
            ))}
          </div>
          <form
            className="message-composer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              if (!requestAccess("message", member.id)) return;
              dispatchSocial({
                type: "message",
                id: member.id,
                message: { id: crypto.randomUUID(), text, mine: true },
              });
              setText("");
            }}
          >
            <label className="sr-only" htmlFor="message-text">
              Votre message fictif
            </label>
            <Textarea
              id="message-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={1000}
              required
              placeholder="Votre message fictif…"
            />
            <Submit disabled={!text.trim()} aria-label="Ajouter le message à la démo">
              <Send size={20} />
            </Submit>
          </form>
        </section>
      ) : (
        <>
          <SearchField value={query} onChange={setQuery} label="Rechercher une conversation…" />
          <div className="conversation-list">
            {social.conversations
              .filter((c) => {
                const m = members.find((m) => m.id === c.memberId)!;
                return matchesQuery(
                  m.name +
                    " " +
                    visibleMessages(social, access, c)
                      .map((x) => x.text)
                      .join(" "),
                  query,
                );
              })
              .map((c) => {
                const m = members.find((m) => m.id === c.memberId)!;
                return (
                  <button
                    className="conversation-row"
                    key={c.memberId}
                    onClick={() => dispatchSocial({ type: "open-chat", id: c.memberId })}
                  >
                    <img src={m.image} alt="" />
                    <span>
                      <strong>{m.name}</strong>
                      <small>
                        {!canReceive(social, access.category)
                          ? "Réception des messages réservée à Premium"
                          : c.messages.at(-1)?.text || "Nouvelle conversation"}
                      </small>
                    </span>
                    {c.unread && canReceive(social, access.category) && (
                      <span className="unread-dot" aria-label="Message non lu" />
                    )}
                  </button>
                );
              })}
          </div>
          {!social.conversations.some((c) => {
            const m = members.find((m) => m.id === c.memberId)!;
            return matchesQuery(
              m.name +
                " " +
                visibleMessages(social, access, c)
                  .map((x) => x.text)
                  .join(" "),
              query,
            );
          }) && (
            <Empty
              title="Aucune conversation trouvée."
              text="Modifiez votre recherche ou commencez un nouvel échange avec le bouton +."
            />
          )}
        </>
      )}
      <Modal
        open={newChat}
        onOpenChange={setNewChat}
        title="Une nouvelle rencontre."
        description="Choisissez un membre fictif pour ouvrir une conversation de démonstration."
      >
        <div className="new-chat-list">
          {members.map((m) => (
            <button
              key={m.id}
              className="conversation-row"
              onClick={() => {
                dispatchSocial({ type: "open-chat", id: m.id });
                setNewChat(false);
              }}
            >
              <img src={m.image} alt="" />
              <span>
                <strong>{m.name}</strong>
                <small>{m.role}</small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </Modal>
    </ProfileLayout>
  );
}

export function OpportunitiesPage() {
  const { social, dispatchSocial, notify } = useDemo();
  const [type, setType] = useState("Toutes");
  const [sport, setSport] = useState("Tous");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const filtered = opportunities.filter(
    (o) =>
      (type === "Toutes" || o.type === type) &&
      (sport === "Tous" || o.sport === sport) &&
      (!savedOnly || social.saved.includes(o.id)) &&
      matchesQuery([o.title, o.city, o.owner, o.sport].join(" "), query),
  );
  return (
    <ProfileLayout>
      <div className="social-title">
        <div>
          <span className="mini-kicker">VOTRE PROCHAIN CHAPITRE</span>
          <h1>
            Opportunities<span>.</span>
          </h1>
        </div>
      </div>
      <p className="social-intro">
        Un projet, une équipe, une rencontre.
        <br />
        Trouvez ce qui vous fait avancer.
      </p>
      <SearchField value={query} onChange={setQuery} label="Une opportunité, une ville…" />
      <Chips
        label="Types d’opportunités"
        values={["Toutes", "Coaching", "Recrutement", "Partenariat", "Sponsoring"]}
        value={type}
        onChange={setType}
      />
      <div className="network-controls">
        <SportSelect id="opportunity-sport" value={sport} onChange={setSport} />
        <Button
          variant="ghost"
          aria-pressed={savedOnly}
          className="followed-filter"
          onClick={() => setSavedOnly(!savedOnly)}
        >
          <Bookmark size={15} />
          {social.saved.length}
          <span className="sr-only">Voir les favoris</span>
        </Button>
      </div>
      <div className="list-caption">
        <span>{savedOnly ? "Vos favoris" : "À explorer"}</span>
        <span>{filtered.length} opportunités</span>
      </div>
      <p className="demo-context">Annonces fictives · aucune candidature ni transaction réelle.</p>
      <div className="opportunity-list">
        {filtered.map((o) => (
          <article className="opportunity-card" key={o.id}>
            <div className="opportunity-cover">
              <img src={o.image} alt={"Illustration · " + o.sport} />
              <span>
                {o.type} / {o.sport}
              </span>
              <Button
                variant="secondary"
                className="save-opportunity"
                aria-label={
                  social.saved.includes(o.id)
                    ? "Retirer des favoris : " + o.title
                    : "Enregistrer : " + o.title
                }
                aria-pressed={social.saved.includes(o.id)}
                onClick={() => dispatchSocial({ type: "save", id: o.id })}
              >
                <Bookmark size={18} fill={social.saved.includes(o.id) ? "currentColor" : "none"} />
              </Button>
            </div>
            <div className="opportunity-body">
              <p>
                {o.owner} · {o.city}
              </p>
              <h2>{o.title}</h2>
              <div>
                <span>{o.format}</span>
                <Button
                  variant="ghost"
                  onClick={() => setSelected(o)}
                  aria-label={"Voir l’opportunité : " + o.title}
                >
                  Voir <ArrowUpRight size={19} />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <Empty
          title="La prochaine occasion reste à trouver."
          text="Essayez d’autres filtres, ou enregistrez une annonce pour la retrouver dans vos favoris."
        />
      )}
      <Modal
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
        title={selected?.title || "Opportunité"}
        description="Annonce fictive : aucune demande n’est transmise à un club ou à un recruteur."
      >
        {selected && (
          <div className="opportunity-detail">
            <span className="sport-chip">
              {selected.type} · {selected.sport}
            </span>
            <p className="opportunity-owner">
              {selected.owner} · {selected.city}
            </p>
            <p>{selected.description}</p>
            <ul>
              {selected.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <Button
              className="action primary"
              aria-pressed={social.interested.includes(selected.id)}
              onClick={() => {
                dispatchSocial({ type: "interest", id: selected.id });
                notify(
                  social.interested.includes(selected.id)
                    ? "Intérêt retiré de la démo."
                    : "Intérêt enregistré dans la démo. Aucune candidature n’a été envoyée.",
                );
              }}
            >
              {social.interested.includes(selected.id)
                ? "Intérêt enregistré · annuler"
                : "Ça m’intéresse · simuler"}
              <Check size={17} />
            </Button>
          </div>
        )}
      </Modal>
    </ProfileLayout>
  );
}
