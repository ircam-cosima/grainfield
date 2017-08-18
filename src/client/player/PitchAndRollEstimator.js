function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

class EulerAngle {
  constructor(alpha, beta, gamma) {
    this.alpha = alpha || 0;
    this.beta = beta || 0;
    this.gamma = gamma || 0;
  }

  setFromRotationMatrix(matrix) {
    const m = matrix.elements;
    let alpha, beta, gamma;

    /**
     * Cf. W3C specification (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
     * and Euler angles Wikipedia page (http://en.wikipedia.org/wiki/Euler_angles).
     *
     * W3C convention: Tait–Bryan angles Z-X'-Y'', where
     *   alpha is in [0; 360[
     *   beta is in [-180; 180[
     *   gamma is in [-90; 90[
     */

    /**
     * In the comments that follow, we use this notation:
     *   cA = cos(alpha)
     *   cB = cos(beta)
     *   cG = cos(gamma)
     *   sA = sin(alpha)
     *   sB = sin(beta)
     *   sG = sin(gamma)
     */

    /**
     * The rotation matrix associated with the rotations Z-X'-Y'' is:
     *   m[0] = cA * cG - sA * sB * sG
     *   m[1] = -cB * sA
     *   m[2] = cA * sG + cG * sA * sB
     *   m[3] = cG * sA + cA * sB * sG
     *   m[4] = cA * cB
     *   m[5] = sA * sG - cA * cG * sB
     *   m[6] = -cB * sG
     *   m[7] = sB
     *   m[8] = cB * cG
     */

    // Since gamma is in [-90; 90[, cG >= 0.
    //
    // Case 1: m[8] > 0 <=> cB > 0                (and cG != 0)
    //                  <=> beta in ]-pi/2; pi/2[ (and cG != 0)
    if (m[8] > 0) {
      alpha = Math.atan2(-m[1], m[4]);
      beta = Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2
      gamma = Math.atan2(-m[6], m[8]);
    }
    // Case 2: m[8] < 0 <=> cB < 0                            (and cG != 0)
    //                  <=> beta in [-pi; -pi/2[ U ]pi/2; pi] (and cG != 0)
    else if (m[8] < 0) {
      // Since cB < 0 and cB is in m[1] and m[4], the point is flipped by 180 degrees.
      // Hence, we have to multiply both arguments of atan2 by -1 in order
      // to revert the point in its original position (=> another flip by 180 degrees).
      alpha = Math.atan2(m[1], -m[4]);
      beta = -Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2
      beta += (beta >= 0) ? -Math.PI : Math.PI; // beta in [-pi; -pi/2[ U ]pi/2; pi]
      gamma = Math.atan2(m[6], -m[8]); // same remark as for alpha
    }
    // Case 3: m[8] = 0 <=> cB = 0 or cG = 0
    else {
      // Subcase 1: cG = 0 and cB > 0
      //            cG = 0 <=> sG = -1 <=> gamma = -pi/2 => m[6] = cB
      //            Hence, m[6] > 0 <=> cB > 0 <=> beta in ]-pi/2; pi/2[
      if (m[6] > 0) {
        alpha = Math.atan2(-m[1], m[4]);
        beta = Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2
        gamma = -Math.PI / 2;
      }
      // Subcase 2: cG = 0 and cB < 0
      //            cG = 0 <=> sG = -1 <=> gamma = -pi/2 => m[6] = cB
      //            Hence, m[6] < 0 <=> cB < 0 <=> beta in [-pi; -pi/2[ U ]pi/2; pi]
      else if (m[6] < 0) {
        alpha = Math.atan2(m[1], -m[4]); // same remark as for alpha in a case above
        beta = -Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2
        beta += (beta >= 0) ? -Math.PI : Math.PI; // beta in [-pi; -pi/2[ U ]pi/2; pi]
        gamma = -Math.PI / 2;
      }
      // Subcase 3: cB = 0
      // In the case where cos(beta) = 0 (i.e. beta = -pi/2 or beta = pi/2),
      // we have the gimbal lock problem: in that configuration, only the angle
      // alpha + gamma (if beta = pi/2) or alpha - gamma (if beta = -pi/2)
      // are uniquely defined: alpha and gamma can take an infinity of values.
      // For convenience, let's set gamma = 0 (and thus sin(gamma) = 0).
      // (As a consequence of the gimbal lock problem, there is a discontinuity
      // in alpha and gamma.)
      else {
        alpha = Math.atan2(m[3], m[0]);
        beta = (m[7] > 0) ? Math.PI / 2 : -Math.PI / 2;
        gamma = 0;
      }
    }

    // atan2 returns a number between -pi and pi
    // => make sure alpha is in [0, 2*pi[.
    if (alpha < 0)
      alpha += 2 * Math.PI;

    this.alpha = radToDeg(alpha);
    this.beta = radToDeg(beta);
    this.gamma = radToDeg(gamma);
  }

  setFromRotationMatrix2(matrix) {
    const m = matrix.elements;
    let alpha, beta, gamma;

    /**
     * Convention here: Tait–Bryan angles Z-X'-Y'', where
     *   alpha is in [0, +360[
     *   beta is in [-90, +90[
     *   gamma is in [-180, +180[
     */
    alpha = Math.atan2(-m[1], m[4]);
    beta = Math.asin(m[7]); // asin returns a number between -pi/2 and pi/2
    gamma = Math.atan2(-m[6], m[8]);

    // atan2 returns a number between -pi and pi
    // => make sure alpha is in [0, 2*pi[.
    if (alpha < 0)
      alpha += 2 * Math.PI;

    this.alpha = radToDeg(alpha);
    this.beta = radToDeg(beta);
    this.gamma = radToDeg(gamma);
  }
}

class RotationMatrix {
  constructor(elements) {
    this.elements = elements || [1, 0, 0, 0, 1, 0, 0, 0, 1]; // defaults to identity matrix
  }

  setFromEulerAngles(alpha, beta, gamma) {
    const a = degToRad(alpha);
    const b = degToRad(beta);
    const g = degToRad(gamma);

    const cA = Math.cos(a);
    const cB = Math.cos(b);
    const cG = Math.cos(g);
    const sA = Math.sin(a);
    const sB = Math.sin(b);
    const sG = Math.sin(g);

    // Tait–Bryan angles Z-X'-Y''
    // Cf. W3C specification (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
    // and Euler angles Wikipedia page (http://en.wikipedia.org/wiki/Euler_angles).
    const m = [cA * cG - sA * sB * sG, -cB * sA, cA * sG + cG * sA * sB, cG * sA + cA * sB * sG, cA * cB, sA * sG - cA * cG * sB, -cB * sG, sB, cB * cG];

    this.elements = m;
    this.normalize();
  }

  normalize() {
    let m = this.elements;
    const det = m[0] * m[4] * m[8] + m[1] * m[5] * m[6] + m[2] * m[3] * m[7] - m[0] * m[5] * m[7] - m[1] * m[3] * m[8] - m[2] * m[4] * m[6];

    for (let i = 0; i < this.elements.length; i++)
      m[i] /= det;
  }
}

class PitchAndRollEstimator {
  constructor() {
    this.matrix = new RotationMatrix();
    this.euler = new EulerAngle();

    this.filteredAccX = 0;
    this.filteredAccY = 0;
    this.filteredAccZ = 0;

    this.pitch = 0;
    this.roll = 0;
  }

  estimateFromAccelerationIncludingGravity(accX, accY, accZ) {
    // Low pass filter on accelerationIncludingGravity data
    const k = 0.8;
    let fX = this.filteredAccX;
    let fY = this.filteredAccY;
    let fZ = this.filteredAccZ;

    fX = k * fX + (1 - k) * accX;
    fY = k * fY + (1 - k) * accY;
    fZ = k * fZ + (1 - k) * accZ;

    this.filteredAccX = fX;
    this.filteredAccY = fY;
    this.filteredAccZ = fZ;

    const norm = Math.sqrt(fX * fX + fY * fY + fZ * fZ);
    fX /= norm;
    fY /= norm;
    fZ /= norm;

    // Beta & gamma equations (we approximate [gX, gY, gZ] by [fX, fY, fZ])
    const beta = radToDeg(Math.asin(fY)); // beta is in [-pi/2; pi/2[
    const gamma = radToDeg(Math.atan2(-fX, fZ)); // gamma is in [-pi; pi[

    // Since we want beta in [-pi; pi[ and gamma in [-pi/2; pi/2[,
    // we pass the angles through the euler > matrix > euler conversion
    const matrix = this.matrix;
    const euler = this.euler;
    matrix.setFromEulerAngles(0, beta, gamma);
    euler.setFromRotationMatrix(matrix);

    this.pitch = euler.beta;
    this.roll = euler.gamma;
  }
}

export default PitchAndRollEstimator;
