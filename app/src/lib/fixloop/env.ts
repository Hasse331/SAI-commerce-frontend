export function getFixloopProjectName() {
  const projectName = process.env.AGENTIC_FIX_LOOP_PROJECT_NAME?.trim();

  return projectName || undefined;
}

export function hasFixloopProjectName() {
  return Boolean(getFixloopProjectName());
}

function parseBooleanEnv(value: string | undefined): boolean | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return undefined;
}

export function hasFixloopEnabled() {
  if (!hasFixloopProjectName()) {
    return false;
  }

  return parseBooleanEnv(process.env.USE_FIXLOOP) ?? true;
}
