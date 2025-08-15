# NicheNode Design System

This document outlines the design system for the NicheNode application. It's a set of guidelines and reusable components to ensure a consistent and professional user experience across the entire platform.

## 1. Color Palette

Our color palette is designed to be modern, professional, and accessible. We use a system of CSS variables to define our colors, which allows for easy theming (e.g., light and dark modes).

### Primary Colors

The primary color is used for key interactive elements, such as buttons, links, and highlights.

- **Primary:** `hsl(222.2 47.4% 11.2%)` (a deep, professional blue)
- **Primary Foreground:** `hsl(210 40% 98%)` (a light color for text on primary backgrounds)

### Secondary Colors

Secondary colors are used for less prominent elements, such as secondary buttons and active filters.

- **Secondary:** `hsl(210 40% 96.1%)` (a light gray)
- **Secondary Foreground:** `hsl(222.2 47.4% 11.2%)` (a dark color for text on secondary backgrounds)

### Accent Colors

Accent colors are used for highlights and to draw attention to specific elements.

- **Accent:** `hsl(210 40% 96.1%)` (the same as secondary by default)
- **Accent Foreground:** `hsl(222.2 47.4% 11.2%)`

### Grayscale

Grayscale colors are used for backgrounds, borders, and text.

- **Background:** `hsl(0 0% 100%)` (white)
- **Foreground:** `hsl(222.2 84% 4.9%)` (almost black)
- **Card:** `hsl(0 0% 100%)` (white)
- **Card Foreground:** `hsl(222.2 84% 4.9%)`
- **Muted:** `hsl(210 40% 96.1%)`
- **Muted Foreground:** `hsl(215.4 16.3% 46.9%)`
- **Border:** `hsl(214.3 31.8% 91.4%)`
- **Input:** `hsl(214.3 31.8% 91.4%)`

### Semantic Colors

- **Destructive:** `hsl(0 84.2% 60.2%)` (for actions like deleting or canceling)

## 2. Typography

We use a modern, sans-serif font for all text in the application. The default font is Inter, with a fallback to the system's default sans-serif font.

- **Font Family:** `Inter, sans-serif`
- **Base Font Size:** `16px`

## 3. Reusable Components

We have a library of reusable UI components located in `src/components/ui`. These components should be used whenever possible to maintain consistency.

### Button

The `Button` component has several variants:

- `default`: The standard button for primary actions.
- `destructive`: For actions that have a destructive consequence.
- `outline`: A button with a border and a transparent background.
- `secondary`: For actions that are less important than the primary action.
- `ghost`: A button with no background or border.
- `link`: A button that looks like a link.

### DashboardCard

The `DashboardCard` component is used to display stats and other information on the dashboard. It has a consistent style with a subtle shadow and border.

### FeatureCard

The `FeatureCard` component is used to highlight key features of the application. It's designed to be more visually prominent than the `DashboardCard`.
