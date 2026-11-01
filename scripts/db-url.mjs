// Makes a Postgres connection string safe to hand to the Supabase CLI and the
// postgres driver, whatever characters the password contains.
//
// Why: a connection string is a URL, postgresql://USER:PASSWORD@HOST:PORT/DB,
// and in a URL the characters @ : / ? # % have meanings of their own. A
// password like "p@ss:w/rd#1" pasted in as-is is misread: the first "@" looks
// like the end of the password, so the parser sees the wrong password and the
// wrong host. URLs avoid that with percent-encoding ("@" becomes "%40"), which
// the Supabase CLI requires. Encoding by hand is easy to get wrong, so this
// does it: paste the string from Supabase with your password exactly as it is,
// and it is encoded here.
//
// How it splits safely: the user name (postgres.<project-ref>) never contains
// ":" and a host never contains "@", so the password is everything between the
// first ":" after the user name and the LAST "@". That works even when the
// password itself contains ":" or "@".

const PLACEHOLDER = /\[YOUR-PASSWORD\]/i;

/**
 * @param {string} raw connection string, password encoded or not
 * @returns {string} the same connection string with the password percent-encoded exactly once
 */
export function normalizeDbUrl(raw) {
  const input = raw.trim();
  const scheme = input.match(/^(postgres(?:ql)?):\/\//i);
  if (!scheme) throw new Error("SUPABASE_DB_URL must start with postgresql:// (copy it from Supabase → Connect).");
  if (PLACEHOLDER.test(input)) {
    throw new Error("SUPABASE_DB_URL still contains [YOUR-PASSWORD]: replace it with your database password.");
  }

  const rest = input.slice(scheme[0].length);
  const at = rest.lastIndexOf("@");
  if (at === -1) throw new Error("SUPABASE_DB_URL has no user and password (expected user:password@host).");
  const credentials = rest.slice(0, at);
  const hostPart = rest.slice(at + 1);
  const colon = credentials.indexOf(":");
  if (colon === -1) throw new Error("SUPABASE_DB_URL has no password (expected user:password@host).");
  const user = credentials.slice(0, colon);
  const password = credentials.slice(colon + 1);
  if (!user || !password) throw new Error("SUPABASE_DB_URL has an empty user or password.");
  if (!hostPart || hostPart.startsWith("/")) throw new Error("SUPABASE_DB_URL has no host.");

  return `postgresql://${encodeURIComponent(decodeOnce(user))}:${encodeURIComponent(decodeOnce(password))}@${hostPart}`;
}

// If the value is already percent-encoded (someone encoded it by hand), decode
// it first so it isn't encoded twice ("%40" must not become "%2540"). A value
// that isn't valid encoding (e.g. a lone "%") is taken as typed.
function decodeOnce(value) {
  if (!/%[0-9a-f]{2}/i.test(value)) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
