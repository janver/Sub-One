<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue';

import { PieChart } from 'echarts/charts';
import type { PieSeriesOption } from 'echarts/charts';
import { LegendComponent, TooltipComponent } from 'echarts/components';
import type { LegendComponentOption, TooltipComponentOption } from 'echarts/components';
import { type ComposeOption, type EChartsType, graphic, init, use } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

import { useThemeStore } from '@/stores/useThemeStore';

const props = defineProps<{
    subscribedNodes: number;
    manualNodes: number;
    activeNodes: number;
    totalNodes: number;
}>();

use([PieChart, TooltipComponent, LegendComponent, SVGRenderer]);

const chartRef = ref<HTMLElement | null>(null);
const chartInstance = shallowRef<EChartsType | null>(null);
const themeStore = useThemeStore();

type NodeChartOption = ComposeOption<
    PieSeriesOption | TooltipComponentOption | LegendComponentOption
>;

const initChart = () => {
    if (!chartRef.value) return;

    if (chartInstance.value) {
        chartInstance.value.dispose();
    }

    chartInstance.value = init(chartRef.value, themeStore.isDarkMode ? 'dark' : undefined, {
        renderer: 'svg'
    });

    const option = getOption();
    chartInstance.value.setOption(option);
};

const getOption = (): NodeChartOption => {
    const isDark = themeStore.isDarkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';

    return {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            textStyle: { color: isDark ? '#f1f5f9' : '#0f172a' },
            padding: [10, 14],
            borderRadius: 12,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.1)'
        },
        legend: {
            bottom: '5%',
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: { color: textColor, fontSize: 12 },
            itemGap: 20
        },
        series: [
            {
                name: '节点分布',
                type: 'pie',
                radius: ['55%', '75%'],
                center: ['50%', '42%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: false
                    },
                    scale: true,
                    itemStyle: {
                        shadowBlur: 15,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    {
                        value: props.subscribedNodes,
                        name: '订阅节点',
                        itemStyle: {
                            color: new graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#6366f1' },
                                { offset: 1, color: '#a855f7' }
                            ])
                        }
                    },
                    {
                        value: props.manualNodes,
                        name: '手动节点',
                        itemStyle: {
                            color: new graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#f97316' },
                                { offset: 1, color: '#fbbf24' }
                            ])
                        }
                    }
                ]
            }
        ]
    };
};

const handleResize = () => {
    chartInstance.value?.resize();
};

onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance.value?.dispose();
});

watch(
    [() => props.subscribedNodes, () => props.manualNodes],
    () => {
        chartInstance.value?.setOption(getOption());
    },
    { deep: true }
);

watch(
    () => themeStore.isDarkMode,
    () => {
        initChart();
    }
);
</script>

<template>
    <div class="relative flex h-full w-full flex-col">
        <div ref="chartRef" class="min-h-45 flex-1"></div>
        <!-- 中心指示器 -->
        <div
            class="pointer-events-none absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        >
            <div class="text-2xl leading-none font-black text-gray-900 dark:text-white">
                {{ totalNodes }}
            </div>
            <div
                class="mt-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400"
            >
                Total
            </div>
        </div>
    </div>
</template>
