# Specification - Dashboard UI (KBMS)

## Overview
Implement the core Battery Monitoring Dashboard UI. This track focuses on the visual representation of battery status using real-time data visualizations (gauges and indicators) and a device management interface.

## User Stories
- **As a user**, I want to see my battery's State of Charge (SOC) at a glance so I know how much power I have left.
- **As a user**, I want to see real-time voltage, current, and temperature to ensure my system is operating safely.
- **As a user**, I want to see a list of connected devices to manage my battery bank configuration.

## Functional Requirements
- **Dashboard Screen:**
    - SOC Gauge: A circular or bar indicator showing percentage.
    - Status Cards: Individual cards for Voltage (V), Current (A), and Temperature (°C).
    - Health Indicator: A simple "Healthy" or "Warning" status label.
- **Device List:**
    - A list component showing connected BMS/Battery units.
    - basic "Connect/Disconnect" status for each device.

## Visual Requirements
- **Theme:** Clean & Modern (Material Design).
- **Color Coding:** 
    - Green for healthy levels.
    - Yellow for warnings.
    - Red for critical levels.
- **Layout:** Responsive design optimized for mobile screens.

## Technical Constraints
- Use React Native `StyleSheet` and Tailwind CSS (NativeWind).
- Use `react-native-reanimated` for smooth gauge transitions.
- Follow TDD as defined in `workflow.md`.
