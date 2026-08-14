<template>
    <Teleport to="body">
        <Transition name="onboard-fade">
            <div v-if="visible" class="onboard-overlay">
                <!-- 步骤 0：欢迎 -->
                <div v-if="step === 0" class="onboard-card">
                    <div class="onboard-icon">🚀</div>
                    <h2>{{ $t('onboarding.welcome') }}</h2>
                    <p>{{ $t('onboarding.intro') }}</p>
                    <div class="onboard-features">
                        <div>
                            <i class="pi pi-folder"></i><span>{{ $t('onboarding.feature1') }}</span>
                        </div>
                        <div>
                            <i class="pi pi-chart-bar"></i
                            ><span>{{ $t('onboarding.feature2') }}</span>
                        </div>
                        <div>
                            <i class="pi pi-download"></i
                            ><span>{{ $t('onboarding.feature3') }}</span>
                        </div>
                        <div>
                            <i class="pi pi-moon"></i><span>{{ $t('onboarding.feature4') }}</span>
                        </div>
                    </div>
                    <div class="onboard-actions">
                        <span class="step-dots"
                            ><span class="active"></span><span></span><span></span
                        ></span>
                        <div>
                            <button class="onboard-skip" @click="close">
                                {{ $t('onboarding.skipTour') }}
                            </button>
                            <button class="onboard-next" @click="next">
                                {{ $t('onboarding.next') }} <i class="pi pi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 步骤 1：导航 -->
                <div v-if="step === 1" class="onboard-spotlight" @click.self="next">
                    <div
                        class="onboard-card onboard-spotlight-card"
                        style="align-self: flex-start; margin-top: 90px"
                    >
                        <div class="onboard-step">
                            {{ $t('onboarding.stepLabel', { n: step + 1 }) }}
                        </div>
                        <h3>{{ $t('onboarding.stepNav') }}</h3>
                        <p>
                            <strong>{{ $t('nav.dashboard') }}</strong
                            >{{ $t('onboarding.stepNavA') }}<strong>{{ $t('nav.projects') }}</strong
                            >{{ $t('onboarding.stepNavB') }}<strong>{{ $t('nav.tasks') }}</strong
                            >{{ $t('onboarding.stepNavC') }}<strong>{{ $t('nav.data') }}</strong
                            >{{ $t('onboarding.stepNavD') }}
                        </p>
                        <p class="hint">{{ $t('onboarding.stepNavHint') }}</p>
                        <div class="onboard-actions">
                            <span class="step-dots"
                                ><span></span><span class="active"></span><span></span
                            ></span>
                            <div>
                                <button class="onboard-skip" @click="close">
                                    {{ $t('onboarding.skipTour') }}
                                </button>
                                <button class="onboard-next" @click="next">
                                    {{ $t('onboarding.next') }} <i class="pi pi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 步骤 2：任务管理 -->
                <div v-if="step === 2" class="onboard-card">
                    <div class="onboard-step">
                        {{ $t('onboarding.stepLabel', { n: step + 1 }) }}
                    </div>
                    <h3>{{ $t('onboarding.stepTasks') }}</h3>
                    <p>{{ $t('onboarding.stepTasksDesc') }}</p>
                    <p>{{ $t('onboarding.stepTasksDesc2') }}</p>
                    <div class="onboard-actions">
                        <span class="step-dots"
                            ><span></span><span></span><span class="active"></span
                        ></span>
                        <div>
                            <button class="onboard-skip" @click="close">
                                {{ $t('onboarding.skipTour') }}
                            </button>
                            <button class="onboard-next" @click="next">
                                {{ $t('onboarding.next') }} <i class="pi pi-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 步骤 3：完成 -->
                <div v-if="step === 3" class="onboard-card">
                    <div class="onboard-icon">✅</div>
                    <h2>{{ $t('onboarding.stepDone') }}</h2>
                    <p>{{ $t('onboarding.stepDoneDesc') }}</p>
                    <p class="hint">{{ $t('onboarding.stepDoneHint') }}</p>
                    <button class="onboard-done" @click="close">
                        {{ $t('onboarding.getStarted') }}
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const STORAGE_KEY = 'easyproject-onboarding-done'
const visible = ref(false)
const step = ref(0)
const { t } = useI18n()

function next() {
    step.value += 1
}

function close() {
    visible.value = false
    localStorage.setItem(STORAGE_KEY, 'true')
}

onMounted(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
        visible.value = true
    }
})

defineExpose({
    show: () => {
        visible.value = true
        step.value = 0
    }
})
</script>

<style scoped>
.onboard-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
}

.onboard-card {
    background: var(--color-surface, #fff);
    border-radius: 1rem;
    padding: 2rem 2.5rem;
    max-width: 480px;
    width: calc(100vw - 3rem);
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
    color: var(--color-text, #172033);
    animation: onboard-pop 0.35s ease;
}

.onboard-spotlight {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
}

.onboard-spotlight-card {
    align-self: flex-start;
    margin-top: 90px;
}

.onboard-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.onboard-step {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-secondary, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
}

.onboard-card h2 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
}

.onboard-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
}

.onboard-card p {
    color: var(--color-text-secondary, #64748b);
    line-height: 1.6;
    margin: 0 0 0.75rem;
}

.hint {
    font-size: 0.85rem;
}

.hint kbd {
    display: inline-block;
    padding: 0.1rem 0.4rem;
    font-size: 0.8rem;
    font-family: 'SF Mono', monospace;
    background: var(--color-bg, #f1f5f9);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 0.25rem;
}

.onboard-features {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    margin: 1rem 0 1.5rem;
}

.onboard-features > div {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.5rem 0.7rem;
    background: var(--color-bg, #f8fafc);
    border-radius: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text, #172033);
}

.onboard-features i {
    color: var(--color-primary, #2563eb);
    font-size: 1.1rem;
}

.onboard-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5rem;
}

.step-dots {
    display: flex;
    gap: 0.4rem;
}

.step-dots span {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--color-border, #e2e8f0);
}

.step-dots span.active {
    background: var(--color-primary, #2563eb);
}

.onboard-skip {
    border: 0;
    background: transparent;
    color: var(--color-text-secondary, #64748b);
    cursor: pointer;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}

.onboard-next,
.onboard-done {
    border: 0;
    padding: 0.55rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.onboard-next {
    color: #fff;
    background: var(--color-primary, #2563eb);
}

.onboard-next:hover {
    opacity: 0.9;
}

.onboard-done {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    margin-top: 0.75rem;
    padding: 0.7rem 2rem;
}

.onboard-fade-enter-active,
.onboard-fade-leave-active {
    transition: opacity 0.3s ease;
}

.onboard-fade-enter-from,
.onboard-fade-leave-to {
    opacity: 0;
}

@keyframes onboard-pop {
    from {
        transform: translateY(12px) scale(0.97);
        opacity: 0;
    }
    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}
</style>
