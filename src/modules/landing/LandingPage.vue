<template>
    <div class="landing-page">
        <a class="landing-skip" href="#main-content">{{ t('landing.skip') }}</a>
        <header class="landing-header">
            <a class="landing-brand" href="/" aria-label="EasyProject">
                <img src="/easyproject.svg" width="38" height="38" alt="" />EasyProject
            </a>
            <nav :aria-label="t('landing.navFeatures')">
                <a href="#features">{{ t('landing.navFeatures') }}</a>
                <a href="#modes">{{ t('landing.navModes') }}</a>
                <a href="#download">{{ t('landing.navDownload') }}</a>
                <a :href="docs + '/README.md'">{{ t('landing.navDocs') }}</a>
            </nav>
            <div class="landing-tools">
                <Button
                    text
                    rounded
                    :label="locale === 'zh-CN' ? 'EN' : '中'"
                    :aria-label="t('landing.language')"
                    @click="changeLanguage"
                />
                <Button
                    text
                    rounded
                    :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                    :aria-label="t('landing.theme')"
                    @click="toggle"
                />
                <Button
                    as="a"
                    href="/index.html#/dashboard"
                    :label="t('landing.online')"
                    class="header-online"
                />
            </div>
        </header>

        <main id="main-content" tabindex="-1">
            <section class="landing-hero landing-container">
                <p class="landing-eyebrow">{{ t('landing.eyebrow') }}</p>
                <h1>
                    {{ t('landing.title') }}<br /><span>{{ t('landing.titleAccent') }}</span>
                </h1>
                <p class="landing-intro">{{ t('landing.intro') }}</p>
                <div class="landing-actions">
                    <Button
                        as="a"
                        href="/index.html#/dashboard"
                        :label="t('landing.online')"
                        icon="pi pi-arrow-right"
                        icon-pos="right"
                    />
                    <Button
                        as="a"
                        href="#download"
                        :label="t('landing.download')"
                        icon="pi pi-desktop"
                        outlined
                    />
                </div>
                <p class="landing-note">{{ t('landing.note') }}</p>
                <figure class="landing-preview">
                    <figcaption>
                        <span class="preview-dots" aria-hidden="true">● ● ●</span
                        >{{ t('landing.previewTitle') }}
                        <SelectButton
                            v-model="previewView"
                            :options="previewOptions"
                            option-label="label"
                            option-value="value"
                            :allow-empty="false"
                            :aria-label="t('landing.previewSelect')"
                        />
                    </figcaption>
                    <img
                        :src="`/landing/project-${previewView}-20261026.png`"
                        width="1280"
                        height="800"
                        :alt="t('landing.previewAlt.' + previewView)"
                        fetchpriority="high"
                    />
                </figure>
                <p class="landing-caption">{{ t('landing.previewNote') }}</p>
            </section>

            <section id="features" class="landing-section landing-container">
                <p class="landing-eyebrow">{{ t('landing.featuresEyebrow') }}</p>
                <h2>{{ t('landing.featuresTitle') }}</h2>
                <div class="landing-features">
                    <article v-for="feature in features" :key="feature.icon">
                        <i :class="['pi', feature.icon]" aria-hidden="true"></i>
                        <h3>{{ feature.title }}</h3>
                        <p>{{ feature.body }}</p>
                    </article>
                </div>
            </section>

            <section id="modes" class="landing-section landing-container">
                <p class="landing-eyebrow">{{ t('landing.modesEyebrow') }}</p>
                <h2>{{ t('landing.modesTitle') }}</h2>
                <div class="landing-modes">
                    <article>
                        <i class="pi pi-globe" aria-hidden="true"></i>
                        <h3>{{ t('landing.webTitle') }}</h3>
                        <p>{{ t('landing.webBody') }}</p>
                        <Button
                            as="a"
                            href="/index.html#/dashboard"
                            :label="t('landing.online')"
                            text
                            icon="pi pi-arrow-right"
                            icon-pos="right"
                        />
                    </article>
                    <article>
                        <i class="pi pi-desktop" aria-hidden="true"></i>
                        <h3>{{ t('landing.localTitle') }}</h3>
                        <p>{{ t('landing.localBody') }}</p>
                        <Button
                            as="a"
                            href="#download"
                            :label="t('landing.download')"
                            text
                            icon="pi pi-arrow-right"
                            icon-pos="right"
                        />
                    </article>
                </div>
                <p class="landing-boundary">
                    <i class="pi pi-info-circle" aria-hidden="true"></i>{{ t('landing.isolation') }}
                </p>
            </section>

            <section class="landing-section landing-container landing-ai">
                <div>
                    <p class="landing-eyebrow">{{ t('landing.aiEyebrow') }}</p>
                    <h2>{{ t('landing.aiTitle') }}</h2>
                </div>
                <div>
                    <p>{{ t('landing.aiBody') }}</p>
                    <p class="landing-note">{{ t('landing.aiNote') }}</p>
                    <Button
                        as="a"
                        :href="docs + '/docs/MCP.md'"
                        :label="t('landing.aiLink')"
                        outlined
                        icon="pi pi-book"
                    />
                </div>
            </section>

            <section id="download" class="landing-section landing-container">
                <p class="landing-eyebrow">{{ t('landing.downloadEyebrow') }}</p>
                <h2>{{ t('landing.downloadTitle') }}</h2>
                <div class="landing-download">
                    <i class="pi pi-desktop" aria-hidden="true"></i>
                    <div>
                        <h3>
                            {{
                                desktopRelease.ready
                                    ? desktopRelease.tag
                                    : t('landing.releaseStatus')
                            }}
                        </h3>
                        <template v-if="desktopRelease.ready">
                            <p>{{ t('landing.betaWarning') }}</p>
                            <p class="landing-note">
                                {{ t('landing.publishedOn') }} {{ desktopRelease.publishedDate }} ·
                                {{ t('landing.systemRequirements') }}
                            </p>
                            <div class="landing-download-links">
                                <article v-for="group in primaryDownloads" :key="group.key">
                                    <h4>{{ group.title }}</h4>
                                    <p>{{ group.hint }}</p>
                                    <Button
                                        v-for="asset in group.assets"
                                        :key="asset.key"
                                        as="a"
                                        :href="desktopRelease.base + asset.file"
                                        :label="t('landing.downloads.' + asset.key)"
                                        icon="pi pi-download"
                                        outlined
                                    />
                                </article>
                            </div>
                            <Panel
                                class="landing-other-downloads"
                                :header="t('landing.otherFormats')"
                                toggleable
                                collapsed
                            >
                                <p>{{ t('landing.otherFormatsHint') }}</p>
                                <div class="landing-secondary-downloads">
                                    <Button
                                        v-for="asset in secondaryDownloads"
                                        :key="asset.key"
                                        as="a"
                                        :href="desktopRelease.base + asset.file"
                                        :label="t('landing.downloads.' + asset.key)"
                                        icon="pi pi-download"
                                        outlined
                                    />
                                </div>
                            </Panel>
                            <p>
                                <a :href="desktopRelease.base + 'SHA256SUMS.txt'">{{
                                    t('landing.checksums')
                                }}</a>
                            </p>
                        </template>
                        <p v-else>{{ t('landing.releaseBody') }}</p>
                        <Button
                            as="a"
                            :href="desktopRelease.ready ? desktopRelease.url : repo + '/releases'"
                            :label="t('landing.releaseAction')"
                            outlined
                            icon="pi pi-external-link"
                        />
                        <p class="landing-note">
                            {{
                                t(desktopRelease.ready ? 'landing.betaNote' : 'landing.releaseNote')
                            }}
                        </p>
                    </div>
                </div>
            </section>

            <section class="landing-section landing-container landing-disclosures">
                <article>
                    <h3>{{ t('landing.privacyTitle') }}</h3>
                    <p>{{ t('landing.privacyBody') }}</p>
                </article>
                <article>
                    <h3>{{ t('landing.trialTitle') }}</h3>
                    <p>{{ t('landing.trialBody') }}</p>
                </article>
            </section>
            <section class="landing-end landing-container">
                <h2>{{ t('landing.endTitle') }}</h2>
                <p>{{ t('landing.endBody') }}</p>
                <Button
                    as="a"
                    href="/index.html#/dashboard"
                    :label="t('landing.online')"
                    icon="pi pi-arrow-right"
                    icon-pos="right"
                />
            </section>
        </main>
        <footer class="landing-footer landing-container">
            <div>
                <strong>EasyProject</strong>
                <p>{{ t('landing.footer') }}</p>
            </div>
            <nav>
                <a :href="repo">GitHub</a><a :href="docs + '/README.md'">{{ t('landing.docs') }}</a
                ><a :href="docs + '/CHANGELOG.md'">{{ t('landing.changelog') }}</a
                ><a :href="repo + '/issues'">{{ t('landing.issues') }}</a>
            </nav>
        </footer>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import SelectButton from 'primevue/selectbutton'
import Panel from 'primevue/panel'
import { useTheme } from '../../composables/useTheme'
import { setLocale } from '../../i18n'
import { desktopRelease } from './downloadRelease'

const repo = 'https://github.com/15169046827/easy-project'
// Pin to verified public documentation: the feature branch is not merged into main yet.
const docs = repo + '/blob/31c756ef18a1abe649b99d611c03e7b7493c6d87'
const { t, tm, locale } = useI18n()
const { isDark, toggle } = useTheme()
const previewView = ref('tasks')
const previewOptions = computed(() => [
    { value: 'tasks', label: t('landing.previewTasks') },
    { value: 'board', label: t('landing.previewBoard') }
])
const primaryDownloads = computed(() => [
    {
        key: 'windows',
        title: 'Windows',
        hint: t('landing.windowsDownloadHint'),
        assets: desktopRelease.assets.filter(asset => asset.key === 'winNsis')
    },
    {
        key: 'macos',
        title: 'macOS',
        hint: t('landing.macDownloadHint'),
        assets: desktopRelease.assets.filter(asset =>
            ['macArmDmg', 'macIntelDmg'].includes(asset.key)
        )
    }
])
const secondaryDownloads = desktopRelease.assets.filter(asset =>
    ['winMsi', 'macArmApp', 'macIntelApp'].includes(asset.key)
)
const features = computed(
    () => /** @type {{ title: string, body: string, icon: string }[]} */ (tm('landing.features'))
)
function changeLanguage() {
    setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN')
}
</script>

<style>
.landing-page {
    --lp-bg: #f8fafc;
    --lp-surface: #fff;
    --lp-text: #172554;
    --lp-muted: #475569;
    --lp-border: #dce5f1;
    --lp-accent: #2563eb;
    color: var(--lp-text);
    background: var(--lp-bg);
    font-family: Inter, 'Segoe UI', 'Microsoft YaHei', sans-serif;
    line-height: 1.65;
}
.app-dark .landing-page {
    --lp-bg: #0f172a;
    --lp-surface: #172338;
    --lp-text: #e6efff;
    --lp-muted: #b6c5da;
    --lp-border: #32435c;
    --lp-accent: #93c5fd;
}
.landing-page * {
    box-sizing: border-box;
}
.landing-page a {
    color: inherit;
    text-decoration: none;
}
.landing-page a:focus-visible,
.landing-page button:focus-visible {
    outline: 3px solid var(--lp-accent);
    outline-offset: 4px;
}
.landing-page a:not(.p-button):hover {
    color: var(--lp-accent);
    text-decoration: underline;
}
.landing-page p {
    color: var(--lp-muted);
}
.landing-page h1,
.landing-page h2,
.landing-page h3 {
    line-height: 1.3;
    text-wrap: balance;
}
.landing-container {
    width: min(1120px, calc(100% - 48px));
    margin-inline: auto;
}
.landing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 18px max(24px, calc((100% - 1120px) / 2));
    border-bottom: 1px solid var(--lp-border);
    background: var(--lp-surface);
}
.landing-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 21px;
    font-weight: 750;
    white-space: nowrap;
}
.landing-header nav,
.landing-tools,
.landing-actions,
.landing-footer nav {
    display: flex;
    align-items: center;
    gap: 22px;
}
.landing-header nav {
    font-size: 14px;
}
.landing-tools {
    gap: 6px;
}
.landing-tools .p-button {
    flex-shrink: 0;
}
.landing-skip {
    position: absolute;
    top: -80px;
    left: 16px;
    padding: 12px;
    z-index: 10;
    background: var(--lp-surface);
}
.landing-skip:focus {
    top: 12px;
}
.landing-hero {
    padding-top: 80px;
    text-align: center;
}
.landing-page .landing-eyebrow {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--lp-accent);
}
.landing-hero h1 {
    font-size: clamp(40px, 5vw, 68px);
    letter-spacing: -0.04em;
    margin: 20px 0;
}
.landing-hero h1 span {
    color: var(--lp-accent);
}
.landing-intro {
    max-width: 640px;
    margin: 0 auto 28px;
    font-size: 18px;
}
.landing-actions {
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
}
.landing-page .landing-note,
.landing-caption {
    font-size: 13px;
}
.landing-preview {
    margin: 48px 0 0;
    overflow: hidden;
    border: 1px solid var(--lp-border);
    border-radius: 16px;
    background: var(--lp-surface);
    box-shadow: 0 18px 60px #1e40af12;
}
.landing-preview figcaption {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 18px;
    font-size: 12px;
    color: var(--lp-muted);
    text-align: left;
    border-bottom: 1px solid var(--lp-border);
}
.landing-preview .p-selectbutton {
    margin-left: auto;
}
.preview-dots {
    margin-right: 18px;
    letter-spacing: 4px;
    color: #94a3b8;
}
.landing-preview img {
    display: block;
    width: 100%;
    height: auto;
}
.landing-section {
    padding-top: 88px;
    scroll-margin-top: 28px;
}
.landing-section h2,
.landing-end h2 {
    font-size: clamp(26px, 3vw, 36px);
    margin: 12px 0 30px;
    letter-spacing: -0.02em;
}
.landing-features {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 28px;
}
.landing-features i,
.landing-modes > article > i,
.landing-download > i {
    font-size: 25px;
    color: var(--lp-accent);
}
.landing-features h3,
.landing-modes h3,
.landing-download h3 {
    font-size: 18px;
    margin: 20px 0 12px;
}
.landing-download-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}
.landing-download-links article {
    min-width: 0;
    padding: 18px;
    border: 1px solid var(--lp-border);
    border-radius: 12px;
}
.landing-download-links h4 {
    margin: 0;
    color: var(--lp-text);
}
.landing-download-links article p {
    font-size: 13px;
}
.landing-download-links .p-button {
    max-width: 100%;
    margin: 4px 0;
}
.landing-other-downloads {
    margin-top: 16px;
}
.landing-secondary-downloads {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.landing-features p {
    font-size: 14px;
}
.landing-modes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}
.landing-modes article {
    padding: 32px;
    border: 1px solid var(--lp-border);
    border-radius: 16px;
    background: var(--lp-surface);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
.landing-modes article p {
    flex: 1;
    margin-top: 0;
}
.landing-boundary {
    display: flex;
    gap: 12px;
    align-items: baseline;
    font-size: 14px;
}
.landing-ai {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
}
.landing-ai h2 {
    margin-bottom: 0;
}
.landing-ai > div > p:first-child {
    margin-top: 0;
}
.landing-download {
    display: flex;
    align-items: flex-start;
    gap: 28px;
    padding: 32px;
    border: 1px solid var(--lp-border);
    border-radius: 16px;
    background: var(--lp-surface);
}
.landing-download > i {
    margin-top: 4px;
}
.landing-download h3 {
    margin-top: 0;
}
.landing-disclosures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    font-size: 14px;
}
.landing-disclosures h3 {
    font-size: 16px;
}
.landing-end {
    text-align: center;
    padding-block: 80px;
}
.landing-end h2 {
    margin-bottom: 12px;
}
.landing-footer {
    border-top: 1px solid var(--lp-border);
    padding-block: 28px;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    font-size: 13px;
}
.landing-footer p {
    margin-bottom: 0;
}
@media (max-width: 960px) {
    .landing-header {
        flex-wrap: wrap;
    }
    .landing-header nav {
        order: 3;
        width: 100%;
        justify-content: center;
    }
    .landing-features {
        grid-template-columns: repeat(2, 1fr);
    }
    .landing-hero {
        padding-top: 50px;
    }
}
@media (max-width: 600px) {
    .landing-container {
        width: calc(100% - 32px);
    }
    .landing-header {
        gap: 12px;
        padding: 14px 16px;
    }
    .landing-brand {
        font-size: 18px;
    }
    .landing-tools .header-online {
        display: none;
    }
    .landing-header nav {
        gap: 24px;
        font-size: 13px;
    }
    .landing-intro {
        font-size: 16px;
    }
    .landing-features,
    .landing-download-links,
    .landing-modes,
    .landing-ai,
    .landing-disclosures {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    .landing-section {
        padding-top: 56px;
    }
    .landing-modes article,
    .landing-download {
        padding: 24px;
    }
    .landing-download {
        gap: 16px;
    }
    .landing-footer {
        flex-direction: column;
    }
    .landing-footer nav {
        flex-wrap: wrap;
        gap: 20px;
    }
    .landing-preview {
        margin-top: 32px;
        border-radius: 10px;
    }
}
</style>
