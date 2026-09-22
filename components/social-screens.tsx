"use client";
import { isPremium, isConnected, inCommunityFeed, matchesOpportunityType } from "@/lib/social";
import { ConnectionControls } from "./connection-controls";
import { ApplyButton, AppointmentRequestButton } from "./career-screens";
import { T, useLocale } from "./locale";
import {
  feedCategories,
  opportunityCategories,
  emptyFeedFilters,
  matchesFeed,
  memberSearchFilters,
  type FeedCategory,
  type OpportunityCategory,
} from "@/lib/community";
import { canViewMatch, profileCity } from "@/lib/events";
import { moderateText } from "@/lib/trust";
import { MatchCard } from "./play-screens";
import { PostExcerpt } from "./post-excerpt";
import { PostAttachment, usePostAttachment } from "./post-attachment";
import Link from "next/link";
import { ageOn } from "@/lib/sport-profile";
import { MemberDossier, SafetyActions } from "./trust-screens";
import { memberSports } from "@/lib/trust";
import {
  countrySuggestions,
  emptyDirectoryFilters,
  matchesDirectory,
  type DirectoryFilters,
} from "@/lib/directory";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useDemo } from "./demo-provider";
import { PlanStatus, LockedFeature } from "./subscription-ui";
import { NetworkSections } from "./event-navigation";
import { ProfileLayout, Modal } from "./profile-screens";
import { Submit } from "./studio-ui";
import { displayName, sports } from "@/lib/model";
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
      <label htmlFor={id}>
        <T>{"Sport"}</T>
      </label>
      <NativeSelect id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <NativeSelectOption value="Tous">
          <T>{"Tous les sports"}</T>
        </NativeSelectOption>
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
  const {
    profile,
    social,
    dispatchSocial,
    notify,
    requestAccess,
    access,
    events,
    trust,
    dispatchExtension,
    careerActor,
    extensionWorkspace,
  } = useDemo();
  const { t } = useLocale();
  const premium = isPremium(social, profile.category);
  const [feedFilters, setFeedFilters] = useState({ ...emptyFeedFilters });
  const [showFilters, setShowFilters] = useState(false);
  const [postCategory, setPostCategory] = useState<FeedCategory>("News");
  const [postOpportunity, setPostOpportunity] = useState<OpportunityCategory>(
    opportunityCategories[0],
  );
  const [scheduled, setScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [composeError, setComposeError] = useState("");
  const [compose, setCompose] = useState(false);
  const [postSport, setPostSport] = useState("-");
  const [text, setText] = useState("");
  const attachment = usePostAttachment();
  const [commentsId, setCommentsId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const posts = social.posts.filter(
    (p) =>
      !trust.blocked.includes(p.author) &&
      inCommunityFeed(social, p.author) &&
      matchesFeed(p, feedFilters, premium),
  );
  const openMatches = events.matches.filter(
    (m) =>
      m.open &&
      !m.cancelled &&
      !m.confirmed &&
      m.slots.some((s) => Date.parse(s.start) > Date.now()) &&
      !trust.blocked.includes(m.host) &&
      canViewMatch(m, {
        premium,
        category: profile.category,
        city: profileCity(profile.city),
        radius: events.radius,
        now: Date.now(),
      }) &&
      matchesFeed(
        { category: "Matchs ouverts", sport: m.sport, text: m.title + " " + m.city },
        feedFilters,
        premium,
      ),
  );
  const plannedCount = extensionWorkspace.schedules.filter((p) => p.status === "planned").length;
  const selected = social.posts.find((p) => p.id === commentsId);
  return (
    <ProfileLayout>
      <div className="social-title community-heading">
        <h1>
          <T>{"Le fil de votre communauté"}</T>
        </h1>
        {premium && (
          <Button
            variant="ghost"
            aria-label={t("Filtrer le fil")}
            aria-expanded={showFilters}
            aria-controls="feed-filters"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={20} />
            <T>{"Filtres"}</T>
          </Button>
        )}
      </div>
      {premium && showFilters && (
        <section id="feed-filters" className="community-filters" aria-label={t("Filtres du fil")}>
          <SearchField
            label={t("Rechercher dans le fil")}
            value={feedFilters.query}
            onChange={(query) => setFeedFilters((f) => ({ ...f, query }))}
          />
          <label>
            <T>{"Catégorie"}</T>
            <NativeSelect
              aria-label={t("Catégorie du fil")}
              value={feedFilters.category}
              onChange={(e) =>
                setFeedFilters((f) => ({
                  ...f,
                  category: e.target.value,
                  opportunityCategory: "Tous",
                }))
              }
            >
              {["Tous", ...feedCategories].map((v) => (
                <NativeSelectOption key={v} value={v}>
                  {t(v)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          {feedFilters.category === "Opportunités" && (
            <label>
              <T>{"Type d’opportunité"}</T>
              <NativeSelect
                aria-label={t("Type d’opportunité")}
                value={feedFilters.opportunityCategory}
                onChange={(e) =>
                  setFeedFilters((f) => ({ ...f, opportunityCategory: e.target.value }))
                }
              >
                {["Tous", ...opportunityCategories].map((v) => (
                  <NativeSelectOption key={v} value={v}>
                    {t(v)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
          )}
          <SportSelect
            id="feed-sport"
            value={feedFilters.sport}
            onChange={(sport) => setFeedFilters((f) => ({ ...f, sport }))}
          />
          <Button variant="ghost" onClick={() => setFeedFilters({ ...emptyFeedFilters })}>
            <T>{"Réinitialiser les filtres"}</T>
          </Button>
        </section>
      )}
      <button
        type="button"
        className="compose-launch"
        onClick={() => {
          if (requestAccess("publish")) {
            setComposeError("");
            setCompose(true);
          }
        }}
      >
        <img src={profile.photo} alt="" />
        <span>
          <T>{"Quoi de neuf sur votre terrain ?"}</T>
          <small>
            <T>{"Partager un moment, une idée, une réussite"}</T>
          </small>
        </span>
        <Plus size={22} />
      </button>
      {premium && plannedCount > 0 && (
        <Link className="text-link community-planned" href="/publications-programmees">
          {plannedCount} <T>{"publications programmées"}</T>
        </Link>
      )}
      <div className="list-caption" role="status">
        <span>
          {posts.length + openMatches.length} <T>{"publications"}</T>
        </span>
      </div>
      <p className="demo-context">
        <T>{"Profils et publications fictifs · rien n’est publié en ligne."}</T>
      </p>
      <div className="feed-list">
        {openMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
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
            <p className="post-category">
              <T>{post.category || "Divers"}</T>
              {post.opportunityCategory && (
                <>
                  {" "}
                  · <T>{post.opportunityCategory}</T>
                </>
              )}
            </p>
            <button
              type="button"
              className="post-open"
              aria-label={
                t("Ouvrir la publication de") +
                " " +
                (post.author === "self" ? displayName(profile) : post.name)
              }
              onClick={() => {
                setCommentsId(post.id);
                setComment("");
              }}
            >
              <PostExcerpt text={post.text} />
              <span className="post-read-more">
                <T>{"Voir la publication"}</T>
                <ArrowUpRight size={14} />
              </span>
              {post.image && (
                <img
                  className="post-image"
                  src={post.image}
                  alt={"Illustration sportive · " + post.sport}
                />
              )}
            </button>
            {post.video && (
              <video
                className="post-image"
                controls
                playsInline
                preload="metadata"
                src={post.video}
                aria-label="Vidéo de la publication"
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
              <span>
                <T>{"Démo"}</T>
              </span>
            </div>
          </article>
        ))}
      </div>
      {!posts.length && !openMatches.length && (
        <Empty
          title="Le terrain est à vous."
          text="Aucune publication pour ces critères. Modifiez les filtres ou partagez une publication."
        />
      )}
      <Modal
        open={compose}
        onOpenChange={(open) => {
          setCompose(open);
          if (!open) attachment.clear();
        }}
        title="À vous de jouer."
        description="Publication de démonstration, visible uniquement pendant cette visite. N’utilisez pas d’informations personnelles."
      >
        <form
          className="social-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim() || attachment.busy || attachment.error) return;
            if (!requestAccess("publish")) return;
            setComposeError("");
            const moderation = moderateText(text);
            if (moderation) {
              setComposeError(t("Ce contenu ne peut pas être publié."));
              return;
            }
            const classification = {
              category: postCategory,
              opportunityCategory: postCategory === "Opportunités" ? postOpportunity : undefined,
            };
            if (scheduled) {
              if (!premium) {
                setComposeError(t("La programmation est réservée aux membres Premium."));
                return;
              }
              if (careerActor.id !== "self") {
                setComposeError(t("Revenez à votre profil pour programmer une publication."));
                return;
              }
              const date = Date.parse(scheduledAt);
              if (!Number.isFinite(date) || date <= Date.now()) {
                setComposeError(t("Choisissez une date et une heure futures."));
                return;
              }
              dispatchExtension({
                type: "schedule",
                value: {
                  id: crypto.randomUUID(),
                  text,
                  sport: postSport,
                  image:
                    attachment.media && !attachment.media.video ? attachment.media.url : undefined,
                  video: attachment.media?.video ? attachment.media.url : undefined,
                  ...classification,
                  start: new Date(date).toISOString(),
                  status: "planned",
                },
              });
              notify(
                t(
                  "Publication programmée dans la démo. Gardez cet onglet ouvert pour la diffusion.",
                ),
              );
            } else {
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
                  image:
                    attachment.media && !attachment.media.video ? attachment.media.url : undefined,
                  video: attachment.media?.video ? attachment.media.url : undefined,
                  ...classification,
                  likes: 0,
                  liked: false,
                  comments: [],
                },
              });
              notify(t("Publication ajoutée au fil de démonstration uniquement."));
            }
            setText("");
            attachment.clear(true);
            setPostSport("-");
            setScheduled(false);
            setScheduledAt("");
            setFeedFilters({ ...emptyFeedFilters });
            setCompose(false);
          }}
        >
          {composeError && (
            <p role="alert" className="event-error">
              {composeError}
            </p>
          )}
          <label htmlFor="post-category">
            <T>{"Catégorie"}</T>
          </label>
          <NativeSelect
            id="post-category"
            value={postCategory}
            onChange={(e) => setPostCategory(e.target.value as FeedCategory)}
          >
            {feedCategories.map((v) => (
              <NativeSelectOption key={v} value={v}>
                {t(v)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {postCategory === "Opportunités" && (
            <>
              <label htmlFor="post-opportunity">
                <T>{"Type d’opportunité"}</T>
              </label>
              <NativeSelect
                id="post-opportunity"
                value={postOpportunity}
                onChange={(e) => setPostOpportunity(e.target.value as OpportunityCategory)}
              >
                {opportunityCategories.map((v) => (
                  <NativeSelectOption key={v} value={v}>
                    {t(v)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </>
          )}
          <label htmlFor="post-text">
            <T>{"Votre publication"}</T>
          </label>
          {!canReceive(social, profile.category) && (
            <p className="free-plan-note">
              <T>
                {
                  "Vous pouvez publier gratuitement. La réception des commentaires sur votre post sera disponible avec Premium."
                }
              </T>
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
          <label htmlFor="post-sport">
            <T>{"Discipline"}</T>
          </label>
          <NativeSelect
            id="post-sport"
            value={postSport}
            onChange={(e) => setPostSport(e.target.value)}
          >
            <NativeSelectOption value="-">-</NativeSelectOption>
            {sports.map((s) => (
              <NativeSelectOption key={s}>{s}</NativeSelectOption>
            ))}
          </NativeSelect>
          <PostAttachment attachment={attachment} />
          <fieldset className="community-schedule">
            <legend>
              <T>{"Quand publier ?"}</T>
            </legend>
            <label className="schedule-toggle">
              <input
                type="checkbox"
                checked={scheduled && premium}
                disabled={!premium}
                aria-describedby={!premium ? "schedule-premium-hint" : undefined}
                onChange={(e) => setScheduled(e.target.checked)}
              />
              <T>{"Programmer cette publication"}</T>
              {!premium && (
                <span className="schedule-premium-badge" aria-hidden="true">
                  Premium
                </span>
              )}
            </label>
            {!premium && (
              <div className="schedule-premium-notice">
                <p className="field-hint" id="schedule-premium-hint">
                  <T>{"La programmation est réservée aux membres Premium."}</T>
                </p>
                <Link href="/abonnement?retour=/accueil">
                  <T>{"Découvrir Premium"}</T>
                </Link>
              </div>
            )}
            {scheduled && premium && (
              <>
                <label htmlFor="post-start">
                  <T>{"Date et heure (heure locale)"}</T>
                </label>
                <Input
                  id="post-start"
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
                <p className="field-hint">
                  <T>{"La démo doit rester ouverte pour publier à l’heure choisie."}</T>
                </p>
              </>
            )}
          </fieldset>
          <Submit
            className="action primary"
            disabled={!text.trim() || attachment.busy || !!attachment.error}
          >
            <T>{scheduled && premium ? "Programmer" : "Publier dans la démo"}</T>
            <ArrowUpRight size={18} />
          </Submit>
        </form>
      </Modal>
      <Modal
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setCommentsId(null);
        }}
        title="La publication complète"
        description="Publication et commentaires de démonstration, conservés pendant cette visite."
      >
        {selected && (
          <>
            <article className="post-detail">
              <header className="post-author">
                <img src={selected.avatar} alt="" />
                <div>
                  <h2>{selected.author === "self" ? displayName(profile) : selected.name}</h2>
                  <p>{selected.role}</p>
                </div>
                <span className="post-sport">{selected.sport}</span>
              </header>
              <p className="post-text post-full-text">{selected.text}</p>
              {selected.video && (
                <video
                  className="post-image"
                  controls
                  playsInline
                  src={selected.video}
                  aria-label="Vidéo de la publication"
                />
              )}
              {selected.image && (
                <img
                  className="post-image"
                  src={selected.image}
                  alt={"Illustration sportive · " + selected.sport}
                />
              )}
              <div className="post-actions">
                <Button
                  variant="ghost"
                  aria-pressed={selected.liked}
                  aria-label={selected.liked ? "Retirer mon j’aime" : "Aimer la publication"}
                  onClick={() => dispatchSocial({ type: "like", id: selected.id })}
                >
                  <Heart size={18} fill={selected.liked ? "currentColor" : "none"} />
                  {selected.likes}
                </Button>
              </div>
            </article>
            <h3 className="post-comments-heading">
              <T>{"Commentaires"}</T>
            </h3>
            <div className="comments-list">
              {visibleComments(social, access, selected).length ? (
                visibleComments(social, access, selected).map((c) => (
                  <div key={c.id}>
                    <strong>{c.name}</strong>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <p>
                  <T>{"Soyez le premier à réagir."}</T>
                </p>
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
                    comment: {
                      id: crypto.randomUUID(),
                      name: displayName(profile),
                      text: comment,
                    },
                  });
                  setComment("");
                }}
              >
                <label htmlFor="comment">
                  <T>{"Votre commentaire"}</T>
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={400}
                  required
                />
                <Submit className="action primary" disabled={!comment.trim()}>
                  <T>{"Commenter dans la démo"}</T>
                  <Send size={16} />
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
  const { social, dispatchSocial, requestAccess, trust, profile } = useDemo();
  const { t } = useLocale();
  const router = useRouter();
  const premium = isPremium(social, profile.category);
  const [filters, setFilters] = useState<DirectoryFilters>({ ...emptyDirectoryFilters });
  const [searchQuery, setSearchQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [expandedInvitations, setExpandedInvitations] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const effectiveFilters = memberSearchFilters(filters, premium);
  const sport = effectiveFilters.sport;
  const updateFilter = (key: keyof DirectoryFilters, value: string) => {
    if (!premium) return;
    setFilters((f) => ({ ...f, [key]: value }));
    setSearched(true);
  };
  const visibleMembers = members.filter((m) => !trust.blocked.includes(m.id));
  const filtered = visibleMembers.filter((m) =>
    matchesDirectory(m, memberSports[m.id] || [], effectiveFilters),
  );
  const invitations = social.connectionInvitations.filter(
    (i) =>
      i.status === "pending" && i.direction !== "outgoing" && !trust.blocked.includes(i.memberId),
  );
  const sentInvitations = social.connectionInvitations.filter(
    (i) =>
      i.status === "pending" && i.direction === "outgoing" && !trust.blocked.includes(i.memberId),
  );
  const suggested = visibleMembers.filter(
    (m) =>
      !isConnected(social, m.id) &&
      !social.connectionInvitations.some((i) => i.memberId === m.id && i.status === "pending"),
  );
  function message(m: Member) {
    if (!requestAccess("message", m.id)) return;
    dispatchSocial({ type: "open-chat", id: m.id });
    router.push("/messages");
  }
  function memberCard(m: Member) {
    return (
      <article className="member-card" key={m.id}>
        <button className="member-intro" onClick={() => setMember(m)}>
          <img src={m.image} alt="" />
          <span>
            <small>
              {m.kind} · {memberSports[m.id]?.map((r) => r.sport).join(" / ") || m.sport}
            </small>
            <strong>{m.name}</strong>
            {m.kind === "Joueurs" && ageOn(m.birthDate) !== null && (
              <span>
                {ageOn(m.birthDate)}
                <T>{"ans"}</T>
              </span>
            )}
            <span>{m.role}</span>
            <span>{[m.gender, m.accountType].filter(Boolean).join(" · ")}</span>
            {memberSports[m.id] && (
              <span className="trust-filter-hint">
                {memberSports[m.id]
                  .filter((r) => sport === "Tous" || r.sport === sport)
                  .map((r) =>
                    [
                      r.sport,
                      r.level,
                      r.ranking,
                      r.position,
                      r.dominantSide,
                      r.paraSport === "yes" ? "Handisport" : "",
                      r.availability,
                      r.contractStatus,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  )
                  .join(" / ")}
              </span>
            )}
            <span className="member-location">
              <MapPin size={12} />
              {m.city}, {m.country}
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
            <T>{"Message"}</T>
          </Button>
        </div>
      </article>
    );
  }
  return (
    <ProfileLayout>
      <div className="social-title">
        <h1>
          <T>{"Votre réseau"}</T>
          <span>.</span>
        </h1>
      </div>
      <NetworkSections />
      <section className="community-section" aria-labelledby="member-search-title">
        <h2 id="member-search-title">
          <T>{"Recherche"}</T>
        </h2>
        <form
          className="community-search-row"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, query: searchQuery }));
            setSearched(true);
          }}
        >
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            label={t("Nom, rôle, club ou ville…")}
          />
          <Button type="submit" aria-label={t("Rechercher des membres")}>
            <ArrowUpRight size={20} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            aria-label={t("Affiner la recherche")}
            aria-controls="member-advanced"
            aria-expanded={advanced}
            onClick={() => setAdvanced(!advanced)}
          >
            <ChevronDown size={20} className={advanced ? "community-chevron-open" : ""} />
          </Button>
        </form>
        {advanced && (
          <div className="community-filters" id="member-advanced">
            {!premium && (
              <div className="member-search-premium" id="member-search-premium-message">
                <p>
                  <T>
                    {
                      "Les filtres avancés sont réservés aux membres Premium. Passez à Premium pour rechercher par pays, ville, sport et classement."
                    }
                  </T>
                </p>
                <Link className="small-primary" href="/abonnement?retour=/reseau">
                  <T>{"Découvrir Premium"}</T>
                </Link>
              </div>
            )}
            <fieldset
              className="directory-filter-grid"
              disabled={!premium}
              aria-label={t("Filtres de recherche avancée")}
              aria-describedby={!premium ? "member-search-premium-message" : undefined}
            >
              <label>
                <T>{"Pays"}</T>
                <Input
                  aria-label={t("Filtrer par pays")}
                  value={filters.country}
                  onChange={(e) => updateFilter("country", e.target.value)}
                  list="member-countries"
                />
              </label>
              <datalist id="member-countries">
                {countrySuggestions.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
              <label>
                <T>{"Ville"}</T>
                <Input
                  aria-label={t("Filtrer par ville")}
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                />
              </label>
              <label>
                <T>{"Sport"}</T>
                <NativeSelect
                  aria-label={t("Filtrer par sport")}
                  value={filters.sport}
                  onChange={(e) => updateFilter("sport", e.target.value)}
                >
                  {["Tous", ...sports].map((v) => (
                    <NativeSelectOption key={v} value={v}>
                      {t(v)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
              <label>
                <T>{"Classement"}</T>
                <Input
                  aria-label={t("Filtrer par classement")}
                  value={filters.ranking}
                  onChange={(e) => updateFilter("ranking", e.target.value)}
                  placeholder="C15.2, P200…"
                />
              </label>
            </fieldset>
            {premium && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilters({ ...emptyDirectoryFilters });
                  setSearchQuery("");
                  setSearched(false);
                }}
              >
                <T>{"Réinitialiser les filtres"}</T>
              </Button>
            )}
          </div>
        )}
        {searched && (
          <div className="community-results">
            <div className="list-caption" role="status">
              {filtered.length} <T>{"résultats"}</T>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearched(false);
                  setSearchQuery("");
                  setFilters({ ...emptyDirectoryFilters });
                }}
              >
                <T>{"Effacer la recherche"}</T>
              </Button>
            </div>
            <div className="network-list">{filtered.map(memberCard)}</div>
            {!filtered.length && (
              <p>
                <T>{"Aucun profil pour ces critères."}</T>
              </p>
            )}
          </div>
        )}
      </section>
      <section className="community-section" aria-labelledby="member-invitations-title">
        <div className="community-section-heading">
          <h2 id="member-invitations-title">
            <T>{"Invitations"}</T> <span>{invitations.length}</span>
          </h2>
          {invitations.length > 2 && (
            <Button
              variant="ghost"
              aria-label={t(
                expandedInvitations ? "Réduire les invitations" : "Voir toutes les invitations",
              )}
              aria-expanded={expandedInvitations}
              aria-controls="member-invitations"
              onClick={() => setExpandedInvitations(!expandedInvitations)}
            >
              <ChevronDown
                size={20}
                className={expandedInvitations ? "community-chevron-open" : ""}
              />
            </Button>
          )}
        </div>
        <div id="member-invitations" className="community-invitations">
          {(expandedInvitations ? invitations : invitations.slice(0, 2)).map((invitation) => {
            const m = members.find((m) => m.id === invitation.memberId);
            return m ? (
              <article className="community-invitation" key={m.id}>
                <button className="community-invitation-profile" onClick={() => setMember(m)}>
                  <img src={m.image} alt="" />
                  <span>
                    <strong>{m.name}</strong>
                    <small>{m.role}</small>
                  </span>
                </button>
                <div className="member-actions">
                  <Button
                    onClick={() =>
                      dispatchSocial({ type: "connection-response", id: m.id, accept: true })
                    }
                  >
                    <T>{"Accepter"}</T>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      dispatchSocial({ type: "connection-response", id: m.id, accept: false })
                    }
                  >
                    <T>{"Refuser"}</T>
                  </Button>
                </div>
              </article>
            ) : null;
          })}
        </div>
        {!invitations.length && (
          <p className="field-hint">
            <T>{"Aucune invitation en attente."}</T>
          </p>
        )}
      </section>
      {!!sentInvitations.length && (
        <details className="connection-sent">
          <summary>Demandes envoyées ({sentInvitations.length})</summary>
          {sentInvitations.map((i) => {
            const person = members.find((m) => m.id === i.memberId)!;
            return (
              <div key={i.memberId}>
                <button type="button" onClick={() => setMember(person)}>
                  {person.name} · En attente
                </button>
                <Button
                  variant="ghost"
                  onClick={() => dispatchSocial({ type: "connection-cancel", id: i.memberId })}
                >
                  Retirer
                </Button>
              </div>
            );
          })}
        </details>
      )}
      <section className="community-section" aria-labelledby="member-suggestions-title">
        <h2 id="member-suggestions-title">
          <T>{"Vous les connaissez peut-être"}</T>
        </h2>
        <div className="network-list">{suggested.map(memberCard)}</div>
        {!suggested.length && (
          <p className="field-hint">
            <T>{"Aucune nouvelle suggestion pour le moment."}</T>
          </p>
        )}
      </section>
      <p className="demo-context">
        <T>{"Profils et invitations fictifs. Les actions restent dans cette démo."}</T>
      </p>
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
            <p>
              {member.city}, {member.country}
            </p>
            <p>{[member.gender, member.accountType].filter(Boolean).join(" · ")}</p>
            <p>{member.bio}</p>
            <div className="member-relationship-actions">
              <ConnectionControls memberId={member.id} />
              <Button
                className="member-follow-button"
                variant="outline"
                aria-pressed={social.following.includes(member.id)}
                disabled={trust.blocked.includes(member.id)}
                onClick={() => dispatchSocial({ type: "follow", id: member.id })}
              >
                {social.following.includes(member.id) ? "Ne plus suivre" : "Suivre"}
              </Button>
            </div>
            <p className="field-hint">
              Suivre affiche ses publications dans votre fil. Une connexion doit être acceptée pour
              échanger sans quota et inviter cette personne à un match.
            </p>
            <MemberDossier key={member.id} member={member} />
            <SafetyActions memberId={member.id} />
            <AppointmentRequestButton member={member} />
            {isConnected(social, member.id) && !trust.blocked.includes(member.id) && (
              <Link className="action secondary" href={`/organiser?invite=${member.id}`}>
                <T>{"Inviter à jouer"}</T>
              </Link>
            )}
            <Button className="action primary" onClick={() => message(member)}>
              <T>
                {isConnected(social, member.id) ? "Écrire librement" : "Commencer une conversation"}
              </T>
              <MessageCircle size={17} />
            </Button>
          </div>
        )}
      </Modal>
    </ProfileLayout>
  );
}

export function MessagesPage() {
  const { social, dispatchSocial, access, requestAccess, trust } = useDemo();
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
          <span className="mini-kicker">
            <T>{"LE LIEN COMMENCE ICI"}</T>
          </span>
          <h1>
            <T>{"Messages"}</T>
            <span>.</span>
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
        <T>{"Conversations simulées. Aucun message n’est envoyé à une personne réelle."}</T>
      </p>
      <PlanStatus compact />
      <Link className="text-link" href="/securite">
        <T>{"Sécurité : signalements et membres bloqués"}</T>
      </Link>
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
          <SafetyActions memberId={member.id} />
          <div
            ref={log}
            className="message-log"
            role="log"
            aria-label="Historique des messages"
            aria-live="polite"
          >
            <span className="chat-date">
              <T>{"CONVERSATION DE DÉMONSTRATION"}</T>
            </span>
            {!active.messages.length && (
              <p className="chat-empty">
                <T>{"Commencez l’échange avec un message fictif."}</T>
              </p>
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
              <T>{"Votre message fictif"}</T>
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
                    disabled={trust.blocked.includes(c.memberId)}
                    onClick={() => dispatchSocial({ type: "open-chat", id: c.memberId })}
                  >
                    <img src={m.image} alt="" />
                    <span>
                      <strong>{m.name}</strong>
                      <small>
                        {trust.blocked.includes(c.memberId)
                          ? "Membre bloqué · gérer dans Sécurité"
                          : !canReceive(social, access.category)
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
          {members
            .filter((m) => !trust.blocked.includes(m.id))
            .map((m) => (
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
      matchesOpportunityType(o, type) &&
      (sport === "Tous" || o.sport === sport) &&
      (!savedOnly || social.saved.includes(o.id)) &&
      matchesQuery([o.title, o.city, o.owner, o.sport].join(" "), query),
  );
  return (
    <ProfileLayout>
      <div className="social-title">
        <div>
          <span className="mini-kicker">
            <T>{"VOTRE PROCHAIN CHAPITRE"}</T>
          </span>
          <h1>
            <T>{"Opportunities"}</T>
            <span>.</span>
          </h1>
        </div>
      </div>
      <p className="social-intro">
        <T>{"Un projet, une équipe, une rencontre."}</T>
        <br />
        <T>{"Trouvez ce qui vous fait avancer."}</T>
      </p>
      <SearchField value={query} onChange={setQuery} label="Une opportunité, une ville…" />
      <Chips
        label="Types d’opportunités"
        values={[
          "Toutes",
          "Coaching",
          "Recrutement",
          "Partenariat",
          "Sponsoring",
          "Essais groupés",
        ]}
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
          <span className="sr-only">
            <T>{"Voir les favoris"}</T>
          </span>
        </Button>
      </div>
      <div className="list-caption">
        <span>{savedOnly ? "Vos favoris" : "À explorer"}</span>
        <span>
          {filtered.length}
          <T>{"opportunités"}</T>
        </span>
      </div>
      <p className="demo-context">
        <T>{"Annonces fictives · aucune candidature ni transaction réelle."}</T>
      </p>
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
                  <T>{"Voir"}</T>
                  <ArrowUpRight size={19} />
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
            {["coach", "tryout"].includes(selected.id) ? (
              <ApplyButton offerId={selected.id} />
            ) : (
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
            )}
          </div>
        )}
      </Modal>
    </ProfileLayout>
  );
}
