/**
 * @author KimlikDAO
 * @externs
 */

/**
 * @typedef {{
 *   isValid: boolean,
 *   errors: !Array<kimlikdao.Error>
 * }}
 */
kimlikdao.SectionReport;

/**
 * @typedef {{
 *   isValid: boolean,
 *   isAuthenticated: boolean,
 *   errors: Array<kimlikdao.Error>,
 *   perSection: !Object<string, !kimlikdao.SectionReport>
 * }}
 */
kimlikdao.ValidationReport;
