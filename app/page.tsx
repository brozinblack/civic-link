import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, FileText, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { articles, courses } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="hero-wrap site-width">
        <div className="edition-row"><span className="section-kicker">THE CIVIC BRIEF</span><span className="demo-pill">DEMO EDITION · SAMPLE CONTENT</span><span className="edition-date">News · learning · public life</span></div>
        <div className="hero-grid">
          <article className="lead-story">
            <div className="lead-image"><Image src="/images/kampala-skyline.jpg" alt="Kampala city skyline" fill priority sizes="(max-width: 720px) 100vw, 62vw" /><span className="image-caption">Kampala skyline · illustrative image</span></div>
            <div className="lead-copy">
              <div className="story-meta"><span className="category-dot" /> CIVIC EXPLAINER <span>·</span> 4 MIN READ</div>
              <h1>Informed citizens make stronger communities.</h1>
              <p>Understand public issues, find reliable sources and take part in civic life with confidence.</p>
              <Link className="text-link" href={`/news/${articles[0].slug}`}>Explore the civic brief <ArrowRight size={16} /></Link>
            </div>
          </article>
          <aside className="hero-aside" aria-label="Featured civic guides">
            <div className="aside-heading"><span className="section-kicker">IN FOCUS</span><Link href="/news">All stories <ArrowUpRight size={14} /></Link></div>
            {articles.slice(1, 4).map((article, index) => <Link className="focus-story" href={`/news/${article.slug}`} key={article.slug}>
              <span className="focus-number">0{index + 1}</span><span className="focus-text"><span className="mini-category">{article.category}</span><strong>{article.title}</strong><small>{article.readTime} <span>·</span> Sample explainer</small></span><ArrowUpRight size={15} className="focus-arrow" />
            </Link>)}
            <div className="source-note"><ShieldCheck size={17} aria-hidden="true" /><p>Every sample story is labeled. Check the source and date before relying on public information.</p></div>
          </aside>
        </div>
      </section>

      <section className="topic-band" aria-label="Browse by topic"><div className="site-width topic-inner"><span className="topic-label">FOLLOW THE ISSUES</span><Link href="/news?category=Parliament">Parliament</Link><Link href="/news?category=Public%20policy">Public policy</Link><Link href="/news?category=Local%20government">Local government</Link><Link href="/news?category=Fact-checking">Fact-checking</Link><Link href="/learn">Civic learning <ArrowRight size={14} /></Link></div></section>

      <section className="section-block site-width">
        <div className="section-heading"><div><span className="section-kicker">LATEST FROM THE DEMO DESK</span><h2>Ideas for informed participation</h2></div><Link className="underlined-link" href="/news">See all stories <ArrowRight size={16} /></Link></div>
        <div className="story-list">
          {articles.slice(1).map((article, index) => <article className="story-row" key={article.slug}><span className="story-index">0{index + 1}</span><div><span className="story-category">{article.category} <span>·</span> SAMPLE</span><h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p></div><span className="story-time">{article.readTime}</span></article>)}
        </div>
      </section>

      <section className="learning-band">
        <div className="site-width learning-inner"><div className="learning-copy"><span className="section-kicker">CIVIC EDUCATION CENTRE</span><h2>Learn how public life works.</h2><p>Short courses introduce institutions, media literacy and constructive participation. Sample lessons are clearly marked for review against authoritative sources.</p><Link className="button button-gold" href="/learn">Explore learning <ArrowRight size={16} /></Link></div>
          <div className="course-preview">{courses.slice(0, 3).map((course, index) => <Link className="course-line" href={`/learn/${course.slug}`} key={course.slug}><span className="course-num">0{index + 1}</span><span><strong>{course.title}</strong><small>{course.lessons} short lessons <span>·</span> {course.duration}</small></span><ArrowUpRight size={15} /></Link>)}</div>
        </div>
      </section>

      <section className="section-block site-width connect-section">
        <div className="section-heading"><div><span className="section-kicker">YOUR VOICE, CONSTRUCTIVELY</span><h2>Find a path to take part.</h2></div><p className="heading-note">Public information and civic participation tools, with clear privacy boundaries.</p></div>
        <div className="connect-grid">
          <Link href="/leaders" className="connect-card"><span className="connect-icon"><Users size={20} /></span><span className="mini-category">DIRECTORY</span><h3>Find public representatives</h3><p>Explore a searchable profile directory. Sample entries are not real office-holders.</p><span className="card-cta">Open directory <ArrowRight size={15} /></span></Link>
          <Link href="/concerns" className="connect-card"><span className="connect-icon"><MessageSquareText size={20} /></span><span className="mini-category">COMMUNITY CONCERNS</span><h3>Raise an issue respectfully</h3><p>Submit and track your own concern. An official response is not guaranteed.</p><span className="card-cta">View the process <ArrowRight size={15} /></span></Link>
          <Link href="/verify" className="connect-card"><span className="connect-icon"><ShieldCheck size={20} /></span><span className="mini-category">TRUST & PRIVACY</span><h3>Understand verification</h3><p>Public news is open to everyone. This demo does not establish citizenship.</p><span className="card-cta">Read how it works <ArrowRight size={15} /></span></Link>
        </div>
      </section>

      <section className="accountability-strip"><div className="site-width strip-inner"><div><span className="section-kicker">A CLEAR RECORD</span><h2>Claims, sources and progress should be easy to understand.</h2></div><div className="strip-points"><span><CheckCircle2 size={16} /> Attribute sources</span><span><FileText size={16} /> Show corrections</span><span><ShieldCheck size={16} /> Separate claims from findings</span></div><Link href="/news" className="button button-outline-light">Explore the demo <ArrowRight size={15} /></Link></div></section>
    </>
  );
}
