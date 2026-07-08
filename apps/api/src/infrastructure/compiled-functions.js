'use strict';
module.exports = {
  __version: '7.1.5',
  'hydrator-users_10000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.email === null) {
        entity.email = null;
      } else if (typeof data.email !== 'undefined') {
        entity.email = data.email;
      }
      if (data.emailNormalized === null) {
        entity.emailNormalized = null;
      } else if (typeof data.emailNormalized !== 'undefined') {
        entity.emailNormalized = data.emailNormalized;
      }
      if (data.passwordHash === null) {
        entity.passwordHash = null;
      } else if (typeof data.passwordHash !== 'undefined') {
        entity.passwordHash = data.passwordHash;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.emailVerifiedAt === null) {
        entity.emailVerifiedAt = null;
      } else if (typeof data.emailVerifiedAt !== 'undefined') {
        if (data.emailVerifiedAt instanceof Date) {
          entity.emailVerifiedAt = data.emailVerifiedAt;
        } else if (typeof data.emailVerifiedAt === 'number' || data.emailVerifiedAt.includes('+') || data.emailVerifiedAt.lastIndexOf('-') > 10 || data.emailVerifiedAt.endsWith('Z')) {
          entity.emailVerifiedAt = new Date(data.emailVerifiedAt);
        } else {
          entity.emailVerifiedAt = new Date(data.emailVerifiedAt + 'Z');
        }
      }
      if (data.sessionEpoch === null) {
        entity.sessionEpoch = null;
      } else if (typeof data.sessionEpoch !== 'undefined') {
        entity.sessionEpoch = data.sessionEpoch;
      }
      if (data.announcementEmailOptIn === null) {
        entity.announcementEmailOptIn = null;
      } else if (typeof data.announcementEmailOptIn !== 'undefined') {
        entity.announcementEmailOptIn = !!data.announcementEmailOptIn;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-users_10000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.email === null) {
        entity.email = null;
      } else if (typeof data.email !== 'undefined') {
        entity.email = data.email;
      }
      if (data.emailNormalized === null) {
        entity.emailNormalized = null;
      } else if (typeof data.emailNormalized !== 'undefined') {
        entity.emailNormalized = data.emailNormalized;
      }
      if (data.passwordHash === null) {
        entity.passwordHash = null;
      } else if (typeof data.passwordHash !== 'undefined') {
        entity.passwordHash = data.passwordHash;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.emailVerifiedAt === null) {
        entity.emailVerifiedAt = null;
      } else if (typeof data.emailVerifiedAt !== 'undefined') {
        if (data.emailVerifiedAt instanceof Date) {
          entity.emailVerifiedAt = data.emailVerifiedAt;
        } else if (typeof data.emailVerifiedAt === 'number' || data.emailVerifiedAt.includes('+') || data.emailVerifiedAt.lastIndexOf('-') > 10 || data.emailVerifiedAt.endsWith('Z')) {
          entity.emailVerifiedAt = new Date(data.emailVerifiedAt);
        } else {
          entity.emailVerifiedAt = new Date(data.emailVerifiedAt + 'Z');
        }
      }
      if (data.sessionEpoch === null) {
        entity.sessionEpoch = null;
      } else if (typeof data.sessionEpoch !== 'undefined') {
        entity.sessionEpoch = data.sessionEpoch;
      }
      if (data.announcementEmailOptIn === null) {
        entity.announcementEmailOptIn = null;
      } else if (typeof data.announcementEmailOptIn !== 'undefined') {
        entity.announcementEmailOptIn = !!data.announcementEmailOptIn;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-users_10000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity UserEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.email === null && last.email === undefined) {
        diff.email = current.email;
      } else if (current.email == null && last.email == null) {
    
      } else if ((current.email != null && last.email == null) || (current.email == null && last.email != null)) {
        diff.email = current.email;
      } else if (last.email !== current.email) {
        diff.email = current.email;
      }
    
      if (current.emailNormalized === null && last.emailNormalized === undefined) {
        diff.emailNormalized = current.emailNormalized;
      } else if (current.emailNormalized == null && last.emailNormalized == null) {
    
      } else if ((current.emailNormalized != null && last.emailNormalized == null) || (current.emailNormalized == null && last.emailNormalized != null)) {
        diff.emailNormalized = current.emailNormalized;
      } else if (last.emailNormalized !== current.emailNormalized) {
        diff.emailNormalized = current.emailNormalized;
      }
    
      if (current.passwordHash === null && last.passwordHash === undefined) {
        diff.passwordHash = current.passwordHash;
      } else if (current.passwordHash == null && last.passwordHash == null) {
    
      } else if ((current.passwordHash != null && last.passwordHash == null) || (current.passwordHash == null && last.passwordHash != null)) {
        diff.passwordHash = current.passwordHash;
      } else if (last.passwordHash !== current.passwordHash) {
        diff.passwordHash = current.passwordHash;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.emailVerifiedAt === null && last.emailVerifiedAt === undefined) {
        diff.emailVerifiedAt = current.emailVerifiedAt;
      } else if (current.emailVerifiedAt == null && last.emailVerifiedAt == null) {
    
      } else if ((current.emailVerifiedAt != null && last.emailVerifiedAt == null) || (current.emailVerifiedAt == null && last.emailVerifiedAt != null)) {
        diff.emailVerifiedAt = current.emailVerifiedAt;
      } else if (!equals(last.emailVerifiedAt, current.emailVerifiedAt)) {
        diff.emailVerifiedAt = current.emailVerifiedAt;
      }
    
      if (current.sessionEpoch === null && last.sessionEpoch === undefined) {
        diff.sessionEpoch = current.sessionEpoch;
      } else if (current.sessionEpoch == null && last.sessionEpoch == null) {
    
      } else if ((current.sessionEpoch != null && last.sessionEpoch == null) || (current.sessionEpoch == null && last.sessionEpoch != null)) {
        diff.sessionEpoch = current.sessionEpoch;
      } else if (!equals(last.sessionEpoch, current.sessionEpoch)) {
        diff.sessionEpoch = current.sessionEpoch;
      }
    
      if (current.announcementEmailOptIn === null && last.announcementEmailOptIn === undefined) {
        diff.announcementEmailOptIn = current.announcementEmailOptIn;
      } else if (current.announcementEmailOptIn == null && last.announcementEmailOptIn == null) {
    
      } else if ((current.announcementEmailOptIn != null && last.announcementEmailOptIn == null) || (current.announcementEmailOptIn == null && last.announcementEmailOptIn != null)) {
        diff.announcementEmailOptIn = current.announcementEmailOptIn;
      } else if (!compareBooleans(last.announcementEmailOptIn, current.announcementEmailOptIn)) {
        diff.announcementEmailOptIn = current.announcementEmailOptIn;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-users_10000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.email !== 'undefined') {
        ret.email = entity.email;
      }
    
      if (typeof entity.emailNormalized !== 'undefined') {
        ret.emailNormalized = entity.emailNormalized;
      }
    
      if (typeof entity.passwordHash !== 'undefined') {
        ret.passwordHash = entity.passwordHash;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.emailVerifiedAt !== 'undefined') {
        ret.emailVerifiedAt = clone(processDateProperty(entity.emailVerifiedAt));
      }
    
      if (typeof entity.sessionEpoch !== 'undefined') {
        ret.sessionEpoch = clone(entity.sessionEpoch);
      }
    
      if (typeof entity.announcementEmailOptIn !== 'undefined') {
        ret.announcementEmailOptIn = entity.announcementEmailOptIn;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-users_10000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity UserEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.email !== 'undefined') {
        ret.email = result.email;
        mapped.email = true;
      }
      if (typeof result.email_normalized !== 'undefined') {
        ret.emailNormalized = result.email_normalized;
        mapped.email_normalized = true;
      }
      if (typeof result.password_hash !== 'undefined') {
        ret.passwordHash = result.password_hash;
        mapped.password_hash = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.email_verified_at !== 'undefined') {
        if (result.email_verified_at == null || result.email_verified_at instanceof Date) {
          ret.emailVerifiedAt = result.email_verified_at;
        } else if (typeof result.email_verified_at === 'bigint') {
          ret.emailVerifiedAt = parseDate(Number(result.email_verified_at));
        } else if (typeof result.email_verified_at === 'number' || result.email_verified_at.includes('+') || result.email_verified_at.lastIndexOf('-') > 10 || result.email_verified_at.endsWith('Z')) {
          ret.emailVerifiedAt = parseDate(result.email_verified_at);
        } else {
          ret.emailVerifiedAt = parseDate(result.email_verified_at + 'Z');
        }
        mapped.email_verified_at = true;
      }
      if (typeof result.session_epoch !== 'undefined') {
        ret.sessionEpoch = result.session_epoch;
        mapped.session_epoch = true;
      }
      if (typeof result.announcement_email_opt_in !== 'undefined') {
        ret.announcementEmailOptIn = result.announcement_email_opt_in == null ? result.announcement_email_opt_in : !!result.announcement_email_opt_in;
        mapped.announcement_email_opt_in = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-users_10000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-users_10000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-users_10000': function(isEntityOrRef) {
    // compiled pk getter for entity UserEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-users_10000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity UserEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-users_10000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity UserEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-unfreeze_requests_15000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UnfreezeRequestEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.suspensionId === null) {
        entity.suspensionId = null;
      } else if (typeof data.suspensionId !== 'undefined') {
        entity.suspensionId = data.suspensionId;
      }
      if (data.reason === null) {
        entity.reason = null;
      } else if (typeof data.reason !== 'undefined') {
        entity.reason = data.reason;
      }
      if (data.supplement === null) {
        entity.supplement = null;
      } else if (typeof data.supplement !== 'undefined') {
        entity.supplement = data.supplement;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.reviewedBy === null) {
        entity.reviewedBy = null;
      } else if (typeof data.reviewedBy !== 'undefined') {
        entity.reviewedBy = data.reviewedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.reviewedAt === null) {
        entity.reviewedAt = null;
      } else if (typeof data.reviewedAt !== 'undefined') {
        if (data.reviewedAt instanceof Date) {
          entity.reviewedAt = data.reviewedAt;
        } else if (typeof data.reviewedAt === 'number' || data.reviewedAt.includes('+') || data.reviewedAt.lastIndexOf('-') > 10 || data.reviewedAt.endsWith('Z')) {
          entity.reviewedAt = new Date(data.reviewedAt);
        } else {
          entity.reviewedAt = new Date(data.reviewedAt + 'Z');
        }
      }
    }
  },
  'hydrator-unfreeze_requests_15000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UnfreezeRequestEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.suspensionId === null) {
        entity.suspensionId = null;
      } else if (typeof data.suspensionId !== 'undefined') {
        entity.suspensionId = data.suspensionId;
      }
      if (data.reason === null) {
        entity.reason = null;
      } else if (typeof data.reason !== 'undefined') {
        entity.reason = data.reason;
      }
      if (data.supplement === null) {
        entity.supplement = null;
      } else if (typeof data.supplement !== 'undefined') {
        entity.supplement = data.supplement;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.reviewedBy === null) {
        entity.reviewedBy = null;
      } else if (typeof data.reviewedBy !== 'undefined') {
        entity.reviewedBy = data.reviewedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.reviewedAt === null) {
        entity.reviewedAt = null;
      } else if (typeof data.reviewedAt !== 'undefined') {
        if (data.reviewedAt instanceof Date) {
          entity.reviewedAt = data.reviewedAt;
        } else if (typeof data.reviewedAt === 'number' || data.reviewedAt.includes('+') || data.reviewedAt.lastIndexOf('-') > 10 || data.reviewedAt.endsWith('Z')) {
          entity.reviewedAt = new Date(data.reviewedAt);
        } else {
          entity.reviewedAt = new Date(data.reviewedAt + 'Z');
        }
      }
    }
  },
  'comparator-unfreeze_requests_15000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity UnfreezeRequestEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.userId === null && last.userId === undefined) {
        diff.userId = current.userId;
      } else if (current.userId == null && last.userId == null) {
    
      } else if ((current.userId != null && last.userId == null) || (current.userId == null && last.userId != null)) {
        diff.userId = current.userId;
      } else if (last.userId !== current.userId) {
        diff.userId = current.userId;
      }
    
      if (current.suspensionId === null && last.suspensionId === undefined) {
        diff.suspensionId = current.suspensionId;
      } else if (current.suspensionId == null && last.suspensionId == null) {
    
      } else if ((current.suspensionId != null && last.suspensionId == null) || (current.suspensionId == null && last.suspensionId != null)) {
        diff.suspensionId = current.suspensionId;
      } else if (last.suspensionId !== current.suspensionId) {
        diff.suspensionId = current.suspensionId;
      }
    
      if (current.reason === null && last.reason === undefined) {
        diff.reason = current.reason;
      } else if (current.reason == null && last.reason == null) {
    
      } else if ((current.reason != null && last.reason == null) || (current.reason == null && last.reason != null)) {
        diff.reason = current.reason;
      } else if (!equals(last.reason, current.reason)) {
        diff.reason = current.reason;
      }
    
      if (current.supplement === null && last.supplement === undefined) {
        diff.supplement = current.supplement;
      } else if (current.supplement == null && last.supplement == null) {
    
      } else if ((current.supplement != null && last.supplement == null) || (current.supplement == null && last.supplement != null)) {
        diff.supplement = current.supplement;
      } else if (!equals(last.supplement, current.supplement)) {
        diff.supplement = current.supplement;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.reviewedBy === null && last.reviewedBy === undefined) {
        diff.reviewedBy = current.reviewedBy;
      } else if (current.reviewedBy == null && last.reviewedBy == null) {
    
      } else if ((current.reviewedBy != null && last.reviewedBy == null) || (current.reviewedBy == null && last.reviewedBy != null)) {
        diff.reviewedBy = current.reviewedBy;
      } else if (last.reviewedBy !== current.reviewedBy) {
        diff.reviewedBy = current.reviewedBy;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.reviewedAt === null && last.reviewedAt === undefined) {
        diff.reviewedAt = current.reviewedAt;
      } else if (current.reviewedAt == null && last.reviewedAt == null) {
    
      } else if ((current.reviewedAt != null && last.reviewedAt == null) || (current.reviewedAt == null && last.reviewedAt != null)) {
        diff.reviewedAt = current.reviewedAt;
      } else if (!equals(last.reviewedAt, current.reviewedAt)) {
        diff.reviewedAt = current.reviewedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-unfreeze_requests_15000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.userId !== 'undefined') {
        ret.userId = entity.userId;
      }
    
      if (typeof entity.suspensionId !== 'undefined') {
        ret.suspensionId = entity.suspensionId;
      }
    
      if (typeof entity.reason !== 'undefined') {
        ret.reason = clone(entity.reason);
      }
    
      if (typeof entity.supplement !== 'undefined') {
        ret.supplement = clone(entity.supplement);
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.reviewedBy !== 'undefined') {
        ret.reviewedBy = entity.reviewedBy;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.reviewedAt !== 'undefined') {
        ret.reviewedAt = clone(processDateProperty(entity.reviewedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-unfreeze_requests_15000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity UnfreezeRequestEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.user_id !== 'undefined') {
        ret.userId = result.user_id;
        mapped.user_id = true;
      }
      if (typeof result.suspension_id !== 'undefined') {
        ret.suspensionId = result.suspension_id;
        mapped.suspension_id = true;
      }
      if (typeof result.reason !== 'undefined') {
        ret.reason = result.reason;
        mapped.reason = true;
      }
      if (typeof result.supplement !== 'undefined') {
        ret.supplement = result.supplement;
        mapped.supplement = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.reviewed_by !== 'undefined') {
        ret.reviewedBy = result.reviewed_by;
        mapped.reviewed_by = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.reviewed_at !== 'undefined') {
        if (result.reviewed_at == null || result.reviewed_at instanceof Date) {
          ret.reviewedAt = result.reviewed_at;
        } else if (typeof result.reviewed_at === 'bigint') {
          ret.reviewedAt = parseDate(Number(result.reviewed_at));
        } else if (typeof result.reviewed_at === 'number' || result.reviewed_at.includes('+') || result.reviewed_at.lastIndexOf('-') > 10 || result.reviewed_at.endsWith('Z')) {
          ret.reviewedAt = parseDate(result.reviewed_at);
        } else {
          ret.reviewedAt = parseDate(result.reviewed_at + 'Z');
        }
        mapped.reviewed_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-unfreeze_requests_15000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UnfreezeRequestEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-unfreeze_requests_15000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UnfreezeRequestEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-unfreeze_requests_15000': function(isEntityOrRef) {
    // compiled pk getter for entity UnfreezeRequestEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-unfreeze_requests_15000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity UnfreezeRequestEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-unfreeze_requests_15000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity UnfreezeRequestEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-suspensions_14000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SuspensionEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.reasonCategory === null) {
        entity.reasonCategory = null;
      } else if (typeof data.reasonCategory !== 'undefined') {
        entity.reasonCategory = data.reasonCategory;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.suspendedBy === null) {
        entity.suspendedBy = null;
      } else if (typeof data.suspendedBy !== 'undefined') {
        entity.suspendedBy = data.suspendedBy;
      }
      if (data.suspendedAt === null) {
        entity.suspendedAt = null;
      } else if (typeof data.suspendedAt !== 'undefined') {
        if (data.suspendedAt instanceof Date) {
          entity.suspendedAt = data.suspendedAt;
        } else if (typeof data.suspendedAt === 'number' || data.suspendedAt.includes('+') || data.suspendedAt.lastIndexOf('-') > 10 || data.suspendedAt.endsWith('Z')) {
          entity.suspendedAt = new Date(data.suspendedAt);
        } else {
          entity.suspendedAt = new Date(data.suspendedAt + 'Z');
        }
      }
      if (data.liftedAt === null) {
        entity.liftedAt = null;
      } else if (typeof data.liftedAt !== 'undefined') {
        if (data.liftedAt instanceof Date) {
          entity.liftedAt = data.liftedAt;
        } else if (typeof data.liftedAt === 'number' || data.liftedAt.includes('+') || data.liftedAt.lastIndexOf('-') > 10 || data.liftedAt.endsWith('Z')) {
          entity.liftedAt = new Date(data.liftedAt);
        } else {
          entity.liftedAt = new Date(data.liftedAt + 'Z');
        }
      }
    }
  },
  'hydrator-suspensions_14000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SuspensionEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.reasonCategory === null) {
        entity.reasonCategory = null;
      } else if (typeof data.reasonCategory !== 'undefined') {
        entity.reasonCategory = data.reasonCategory;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.suspendedBy === null) {
        entity.suspendedBy = null;
      } else if (typeof data.suspendedBy !== 'undefined') {
        entity.suspendedBy = data.suspendedBy;
      }
      if (data.suspendedAt === null) {
        entity.suspendedAt = null;
      } else if (typeof data.suspendedAt !== 'undefined') {
        if (data.suspendedAt instanceof Date) {
          entity.suspendedAt = data.suspendedAt;
        } else if (typeof data.suspendedAt === 'number' || data.suspendedAt.includes('+') || data.suspendedAt.lastIndexOf('-') > 10 || data.suspendedAt.endsWith('Z')) {
          entity.suspendedAt = new Date(data.suspendedAt);
        } else {
          entity.suspendedAt = new Date(data.suspendedAt + 'Z');
        }
      }
      if (data.liftedAt === null) {
        entity.liftedAt = null;
      } else if (typeof data.liftedAt !== 'undefined') {
        if (data.liftedAt instanceof Date) {
          entity.liftedAt = data.liftedAt;
        } else if (typeof data.liftedAt === 'number' || data.liftedAt.includes('+') || data.liftedAt.lastIndexOf('-') > 10 || data.liftedAt.endsWith('Z')) {
          entity.liftedAt = new Date(data.liftedAt);
        } else {
          entity.liftedAt = new Date(data.liftedAt + 'Z');
        }
      }
    }
  },
  'comparator-suspensions_14000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity SuspensionEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.userId === null && last.userId === undefined) {
        diff.userId = current.userId;
      } else if (current.userId == null && last.userId == null) {
    
      } else if ((current.userId != null && last.userId == null) || (current.userId == null && last.userId != null)) {
        diff.userId = current.userId;
      } else if (last.userId !== current.userId) {
        diff.userId = current.userId;
      }
    
      if (current.reasonCategory === null && last.reasonCategory === undefined) {
        diff.reasonCategory = current.reasonCategory;
      } else if (current.reasonCategory == null && last.reasonCategory == null) {
    
      } else if ((current.reasonCategory != null && last.reasonCategory == null) || (current.reasonCategory == null && last.reasonCategory != null)) {
        diff.reasonCategory = current.reasonCategory;
      } else if (last.reasonCategory !== current.reasonCategory) {
        diff.reasonCategory = current.reasonCategory;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.suspendedBy === null && last.suspendedBy === undefined) {
        diff.suspendedBy = current.suspendedBy;
      } else if (current.suspendedBy == null && last.suspendedBy == null) {
    
      } else if ((current.suspendedBy != null && last.suspendedBy == null) || (current.suspendedBy == null && last.suspendedBy != null)) {
        diff.suspendedBy = current.suspendedBy;
      } else if (last.suspendedBy !== current.suspendedBy) {
        diff.suspendedBy = current.suspendedBy;
      }
    
      if (current.suspendedAt === null && last.suspendedAt === undefined) {
        diff.suspendedAt = current.suspendedAt;
      } else if (current.suspendedAt == null && last.suspendedAt == null) {
    
      } else if ((current.suspendedAt != null && last.suspendedAt == null) || (current.suspendedAt == null && last.suspendedAt != null)) {
        diff.suspendedAt = current.suspendedAt;
      } else if (!equals(last.suspendedAt, current.suspendedAt)) {
        diff.suspendedAt = current.suspendedAt;
      }
    
      if (current.liftedAt === null && last.liftedAt === undefined) {
        diff.liftedAt = current.liftedAt;
      } else if (current.liftedAt == null && last.liftedAt == null) {
    
      } else if ((current.liftedAt != null && last.liftedAt == null) || (current.liftedAt == null && last.liftedAt != null)) {
        diff.liftedAt = current.liftedAt;
      } else if (!equals(last.liftedAt, current.liftedAt)) {
        diff.liftedAt = current.liftedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-suspensions_14000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.userId !== 'undefined') {
        ret.userId = entity.userId;
      }
    
      if (typeof entity.reasonCategory !== 'undefined') {
        ret.reasonCategory = entity.reasonCategory;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.suspendedBy !== 'undefined') {
        ret.suspendedBy = entity.suspendedBy;
      }
    
      if (typeof entity.suspendedAt !== 'undefined') {
        ret.suspendedAt = clone(processDateProperty(entity.suspendedAt));
      }
    
      if (typeof entity.liftedAt !== 'undefined') {
        ret.liftedAt = clone(processDateProperty(entity.liftedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-suspensions_14000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity SuspensionEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.user_id !== 'undefined') {
        ret.userId = result.user_id;
        mapped.user_id = true;
      }
      if (typeof result.reason_category !== 'undefined') {
        ret.reasonCategory = result.reason_category;
        mapped.reason_category = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.suspended_by !== 'undefined') {
        ret.suspendedBy = result.suspended_by;
        mapped.suspended_by = true;
      }
      if (typeof result.suspended_at !== 'undefined') {
        if (result.suspended_at == null || result.suspended_at instanceof Date) {
          ret.suspendedAt = result.suspended_at;
        } else if (typeof result.suspended_at === 'bigint') {
          ret.suspendedAt = parseDate(Number(result.suspended_at));
        } else if (typeof result.suspended_at === 'number' || result.suspended_at.includes('+') || result.suspended_at.lastIndexOf('-') > 10 || result.suspended_at.endsWith('Z')) {
          ret.suspendedAt = parseDate(result.suspended_at);
        } else {
          ret.suspendedAt = parseDate(result.suspended_at + 'Z');
        }
        mapped.suspended_at = true;
      }
      if (typeof result.lifted_at !== 'undefined') {
        if (result.lifted_at == null || result.lifted_at instanceof Date) {
          ret.liftedAt = result.lifted_at;
        } else if (typeof result.lifted_at === 'bigint') {
          ret.liftedAt = parseDate(Number(result.lifted_at));
        } else if (typeof result.lifted_at === 'number' || result.lifted_at.includes('+') || result.lifted_at.lastIndexOf('-') > 10 || result.lifted_at.endsWith('Z')) {
          ret.liftedAt = parseDate(result.lifted_at);
        } else {
          ret.liftedAt = parseDate(result.lifted_at + 'Z');
        }
        mapped.lifted_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-suspensions_14000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SuspensionEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-suspensions_14000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SuspensionEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-suspensions_14000': function(isEntityOrRef) {
    // compiled pk getter for entity SuspensionEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-suspensions_14000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity SuspensionEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-suspensions_14000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity SuspensionEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-sns_links_13000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, profiles_59, profiles_60) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.profile === null) {
        entity.profile = null;
      } else if (typeof data.profile !== 'undefined') {
        if (isPrimaryKey(data.profile, true)) {
          entity.profile = factory.createReference(profiles_59, data.profile, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.profile && typeof data.profile === 'object') {
          entity.profile = factory.create(profiles_60, data.profile, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
      }
      if (data.platform === null) {
        entity.platform = null;
      } else if (typeof data.platform !== 'undefined') {
        entity.platform = data.platform;
      }
      if (data.url === null) {
        entity.url = null;
      } else if (typeof data.url !== 'undefined') {
        entity.url = data.url;
      }
      if (data.label === null) {
        entity.label = null;
      } else if (typeof data.label !== 'undefined') {
        entity.label = data.label;
      }
      if (data.sortOrder === null) {
        entity.sortOrder = null;
      } else if (typeof data.sortOrder !== 'undefined') {
        entity.sortOrder = data.sortOrder;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'hydrator-sns_links_13000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, profiles_67, profiles_68) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.profile === null) {
        entity.profile = null;
      } else if (typeof data.profile !== 'undefined') {
        if (isPrimaryKey(data.profile, true)) {
          entity.profile = factory.createReference(profiles_67, data.profile, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.profile && typeof data.profile === 'object') {
          entity.profile = factory.create(profiles_68, data.profile, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
      }
      if (data.platform === null) {
        entity.platform = null;
      } else if (typeof data.platform !== 'undefined') {
        entity.platform = data.platform;
      }
      if (data.url === null) {
        entity.url = null;
      } else if (typeof data.url !== 'undefined') {
        entity.url = data.url;
      }
      if (data.label === null) {
        entity.label = null;
      } else if (typeof data.label !== 'undefined') {
        entity.label = data.label;
      }
      if (data.sortOrder === null) {
        entity.sortOrder = null;
      } else if (typeof data.sortOrder !== 'undefined') {
        entity.sortOrder = data.sortOrder;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'comparator-sns_links_13000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity SnsLinkEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.profile === null && last.profile === undefined) {
        diff.profile = current.profile;
      } else if (current.profile == null && last.profile == null) {
    
      } else if ((current.profile != null && last.profile == null) || (current.profile == null && last.profile != null)) {
        diff.profile = current.profile;
      } else if (last.profile !== current.profile) {
        diff.profile = current.profile;
      }
    
      if (current.platform === null && last.platform === undefined) {
        diff.platform = current.platform;
      } else if (current.platform == null && last.platform == null) {
    
      } else if ((current.platform != null && last.platform == null) || (current.platform == null && last.platform != null)) {
        diff.platform = current.platform;
      } else if (last.platform !== current.platform) {
        diff.platform = current.platform;
      }
    
      if (current.url === null && last.url === undefined) {
        diff.url = current.url;
      } else if (current.url == null && last.url == null) {
    
      } else if ((current.url != null && last.url == null) || (current.url == null && last.url != null)) {
        diff.url = current.url;
      } else if (last.url !== current.url) {
        diff.url = current.url;
      }
    
      if (current.label === null && last.label === undefined) {
        diff.label = current.label;
      } else if (current.label == null && last.label == null) {
    
      } else if ((current.label != null && last.label == null) || (current.label == null && last.label != null)) {
        diff.label = current.label;
      } else if (last.label !== current.label) {
        diff.label = current.label;
      }
    
      if (current.sortOrder === null && last.sortOrder === undefined) {
        diff.sortOrder = current.sortOrder;
      } else if (current.sortOrder == null && last.sortOrder == null) {
    
      } else if ((current.sortOrder != null && last.sortOrder == null) || (current.sortOrder == null && last.sortOrder != null)) {
        diff.sortOrder = current.sortOrder;
      } else if (!equals(last.sortOrder, current.sortOrder)) {
        diff.sortOrder = current.sortOrder;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-sns_links_13000': function(clone, cloneEmbeddable, toArray, EntityIdentifier, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.profile !== 'undefined') {
        if (entity.profile === null) {
          ret.profile = null;
        } else if (entity.profile?.__helper.__identifier && !entity.profile.__helper.hasPrimaryKey()) {
          ret.profile = entity.profile?.__helper.__identifier;
        } else if (typeof entity.profile !== 'undefined') {
          ret.profile = toArray(entity.profile.__helper.getPrimaryKey(true));
        }
      }
    
      if (typeof entity.platform !== 'undefined') {
        ret.platform = entity.platform;
      }
    
      if (typeof entity.url !== 'undefined') {
        ret.url = entity.url;
      }
    
      if (typeof entity.label !== 'undefined') {
        ret.label = entity.label;
      }
    
      if (typeof entity.sortOrder !== 'undefined') {
        ret.sortOrder = clone(entity.sortOrder);
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      return ret;
    }
  },
  'resultMapper-sns_links_13000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity SnsLinkEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.profile_id !== 'undefined') {
        ret.profile = result.profile_id;
        mapped.profile_id = true;
      }
      if (typeof result.platform !== 'undefined') {
        ret.platform = result.platform;
        mapped.platform = true;
      }
      if (typeof result.url !== 'undefined') {
        ret.url = result.url;
        mapped.url = true;
      }
      if (typeof result.label !== 'undefined') {
        ret.label = result.label;
        mapped.label = true;
      }
      if (typeof result.sort_order !== 'undefined') {
        ret.sortOrder = result.sort_order;
        mapped.sort_order = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-sns_links_13000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-sns_links_13000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-sns_links_13000': function(isEntityOrRef) {
    // compiled pk getter for entity SnsLinkEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-sns_links_13000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity SnsLinkEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-sns_links_13000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity SnsLinkEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-reports_12000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ReportEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.targetUserId === null) {
        entity.targetUserId = null;
      } else if (typeof data.targetUserId !== 'undefined') {
        entity.targetUserId = data.targetUserId;
      }
      if (data.targetHandle === null) {
        entity.targetHandle = null;
      } else if (typeof data.targetHandle !== 'undefined') {
        entity.targetHandle = data.targetHandle;
      }
      if (data.reasonCategory === null) {
        entity.reasonCategory = null;
      } else if (typeof data.reasonCategory !== 'undefined') {
        entity.reasonCategory = data.reasonCategory;
      }
      if (data.detail === null) {
        entity.detail = null;
      } else if (typeof data.detail !== 'undefined') {
        entity.detail = data.detail;
      }
      if (data.contactEmail === null) {
        entity.contactEmail = null;
      } else if (typeof data.contactEmail !== 'undefined') {
        entity.contactEmail = data.contactEmail;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.duplicateCount === null) {
        entity.duplicateCount = null;
      } else if (typeof data.duplicateCount !== 'undefined') {
        entity.duplicateCount = data.duplicateCount;
      }
      if (data.inquiryId === null) {
        entity.inquiryId = null;
      } else if (typeof data.inquiryId !== 'undefined') {
        entity.inquiryId = data.inquiryId;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-reports_12000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ReportEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.targetUserId === null) {
        entity.targetUserId = null;
      } else if (typeof data.targetUserId !== 'undefined') {
        entity.targetUserId = data.targetUserId;
      }
      if (data.targetHandle === null) {
        entity.targetHandle = null;
      } else if (typeof data.targetHandle !== 'undefined') {
        entity.targetHandle = data.targetHandle;
      }
      if (data.reasonCategory === null) {
        entity.reasonCategory = null;
      } else if (typeof data.reasonCategory !== 'undefined') {
        entity.reasonCategory = data.reasonCategory;
      }
      if (data.detail === null) {
        entity.detail = null;
      } else if (typeof data.detail !== 'undefined') {
        entity.detail = data.detail;
      }
      if (data.contactEmail === null) {
        entity.contactEmail = null;
      } else if (typeof data.contactEmail !== 'undefined') {
        entity.contactEmail = data.contactEmail;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.duplicateCount === null) {
        entity.duplicateCount = null;
      } else if (typeof data.duplicateCount !== 'undefined') {
        entity.duplicateCount = data.duplicateCount;
      }
      if (data.inquiryId === null) {
        entity.inquiryId = null;
      } else if (typeof data.inquiryId !== 'undefined') {
        entity.inquiryId = data.inquiryId;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-reports_12000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity ReportEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.targetUserId === null && last.targetUserId === undefined) {
        diff.targetUserId = current.targetUserId;
      } else if (current.targetUserId == null && last.targetUserId == null) {
    
      } else if ((current.targetUserId != null && last.targetUserId == null) || (current.targetUserId == null && last.targetUserId != null)) {
        diff.targetUserId = current.targetUserId;
      } else if (last.targetUserId !== current.targetUserId) {
        diff.targetUserId = current.targetUserId;
      }
    
      if (current.targetHandle === null && last.targetHandle === undefined) {
        diff.targetHandle = current.targetHandle;
      } else if (current.targetHandle == null && last.targetHandle == null) {
    
      } else if ((current.targetHandle != null && last.targetHandle == null) || (current.targetHandle == null && last.targetHandle != null)) {
        diff.targetHandle = current.targetHandle;
      } else if (last.targetHandle !== current.targetHandle) {
        diff.targetHandle = current.targetHandle;
      }
    
      if (current.reasonCategory === null && last.reasonCategory === undefined) {
        diff.reasonCategory = current.reasonCategory;
      } else if (current.reasonCategory == null && last.reasonCategory == null) {
    
      } else if ((current.reasonCategory != null && last.reasonCategory == null) || (current.reasonCategory == null && last.reasonCategory != null)) {
        diff.reasonCategory = current.reasonCategory;
      } else if (last.reasonCategory !== current.reasonCategory) {
        diff.reasonCategory = current.reasonCategory;
      }
    
      if (current.detail === null && last.detail === undefined) {
        diff.detail = current.detail;
      } else if (current.detail == null && last.detail == null) {
    
      } else if ((current.detail != null && last.detail == null) || (current.detail == null && last.detail != null)) {
        diff.detail = current.detail;
      } else if (!equals(last.detail, current.detail)) {
        diff.detail = current.detail;
      }
    
      if (current.contactEmail === null && last.contactEmail === undefined) {
        diff.contactEmail = current.contactEmail;
      } else if (current.contactEmail == null && last.contactEmail == null) {
    
      } else if ((current.contactEmail != null && last.contactEmail == null) || (current.contactEmail == null && last.contactEmail != null)) {
        diff.contactEmail = current.contactEmail;
      } else if (last.contactEmail !== current.contactEmail) {
        diff.contactEmail = current.contactEmail;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.duplicateCount === null && last.duplicateCount === undefined) {
        diff.duplicateCount = current.duplicateCount;
      } else if (current.duplicateCount == null && last.duplicateCount == null) {
    
      } else if ((current.duplicateCount != null && last.duplicateCount == null) || (current.duplicateCount == null && last.duplicateCount != null)) {
        diff.duplicateCount = current.duplicateCount;
      } else if (!equals(last.duplicateCount, current.duplicateCount)) {
        diff.duplicateCount = current.duplicateCount;
      }
    
      if (current.inquiryId === null && last.inquiryId === undefined) {
        diff.inquiryId = current.inquiryId;
      } else if (current.inquiryId == null && last.inquiryId == null) {
    
      } else if ((current.inquiryId != null && last.inquiryId == null) || (current.inquiryId == null && last.inquiryId != null)) {
        diff.inquiryId = current.inquiryId;
      } else if (last.inquiryId !== current.inquiryId) {
        diff.inquiryId = current.inquiryId;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-reports_12000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.targetUserId !== 'undefined') {
        ret.targetUserId = entity.targetUserId;
      }
    
      if (typeof entity.targetHandle !== 'undefined') {
        ret.targetHandle = entity.targetHandle;
      }
    
      if (typeof entity.reasonCategory !== 'undefined') {
        ret.reasonCategory = entity.reasonCategory;
      }
    
      if (typeof entity.detail !== 'undefined') {
        ret.detail = clone(entity.detail);
      }
    
      if (typeof entity.contactEmail !== 'undefined') {
        ret.contactEmail = entity.contactEmail;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.duplicateCount !== 'undefined') {
        ret.duplicateCount = clone(entity.duplicateCount);
      }
    
      if (typeof entity.inquiryId !== 'undefined') {
        ret.inquiryId = entity.inquiryId;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-reports_12000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity ReportEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.target_user_id !== 'undefined') {
        ret.targetUserId = result.target_user_id;
        mapped.target_user_id = true;
      }
      if (typeof result.target_handle !== 'undefined') {
        ret.targetHandle = result.target_handle;
        mapped.target_handle = true;
      }
      if (typeof result.reason_category !== 'undefined') {
        ret.reasonCategory = result.reason_category;
        mapped.reason_category = true;
      }
      if (typeof result.detail !== 'undefined') {
        ret.detail = result.detail;
        mapped.detail = true;
      }
      if (typeof result.contact_email !== 'undefined') {
        ret.contactEmail = result.contact_email;
        mapped.contact_email = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.duplicate_count !== 'undefined') {
        ret.duplicateCount = result.duplicate_count;
        mapped.duplicate_count = true;
      }
      if (typeof result.inquiry_id !== 'undefined') {
        ret.inquiryId = result.inquiry_id;
        mapped.inquiry_id = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-reports_12000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ReportEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-reports_12000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ReportEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-reports_12000': function(isEntityOrRef) {
    // compiled pk getter for entity ReportEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-reports_12000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity ReportEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-reports_12000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity ReportEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-profiles_11000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_101, users_102) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.user === null) {
        entity.user = null;
      } else if (typeof data.user !== 'undefined') {
        if (isPrimaryKey(data.user, true)) {
          entity.user = factory.createReference(users_101, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_102, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
      }
      if (data.handle === null) {
        entity.handle = null;
      } else if (typeof data.handle !== 'undefined') {
        entity.handle = data.handle;
      }
      if (data.visibility === null) {
        entity.visibility = null;
      } else if (typeof data.visibility !== 'undefined') {
        entity.visibility = data.visibility;
      }
      if (data.iconImageId === null) {
        entity.iconImageId = null;
      } else if (typeof data.iconImageId !== 'undefined') {
        entity.iconImageId = data.iconImageId;
      }
      if (data.firstName === null) {
        entity.firstName = null;
      } else if (typeof data.firstName !== 'undefined') {
        entity.firstName = data.firstName;
      }
      if (data.lastName === null) {
        entity.lastName = null;
      } else if (typeof data.lastName !== 'undefined') {
        entity.lastName = data.lastName;
      }
      if (data.nameDisplayOrder === null) {
        entity.nameDisplayOrder = null;
      } else if (typeof data.nameDisplayOrder !== 'undefined') {
        entity.nameDisplayOrder = data.nameDisplayOrder;
      }
      if (data.occupation === null) {
        entity.occupation = null;
      } else if (typeof data.occupation !== 'undefined') {
        entity.occupation = data.occupation;
      }
      if (data.searchName === null) {
        entity.searchName = null;
      } else if (typeof data.searchName !== 'undefined') {
        entity.searchName = data.searchName;
      }
      if (data.bio === null) {
        entity.bio = null;
      } else if (typeof data.bio !== 'undefined') {
        entity.bio = data.bio;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-profiles_11000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_115, users_116) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.user === null) {
        entity.user = null;
      } else if (typeof data.user !== 'undefined') {
        if (isPrimaryKey(data.user, true)) {
          entity.user = factory.createReference(users_115, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_116, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
      }
      if (data.handle === null) {
        entity.handle = null;
      } else if (typeof data.handle !== 'undefined') {
        entity.handle = data.handle;
      }
      if (data.visibility === null) {
        entity.visibility = null;
      } else if (typeof data.visibility !== 'undefined') {
        entity.visibility = data.visibility;
      }
      if (data.iconImageId === null) {
        entity.iconImageId = null;
      } else if (typeof data.iconImageId !== 'undefined') {
        entity.iconImageId = data.iconImageId;
      }
      if (data.firstName === null) {
        entity.firstName = null;
      } else if (typeof data.firstName !== 'undefined') {
        entity.firstName = data.firstName;
      }
      if (data.lastName === null) {
        entity.lastName = null;
      } else if (typeof data.lastName !== 'undefined') {
        entity.lastName = data.lastName;
      }
      if (data.nameDisplayOrder === null) {
        entity.nameDisplayOrder = null;
      } else if (typeof data.nameDisplayOrder !== 'undefined') {
        entity.nameDisplayOrder = data.nameDisplayOrder;
      }
      if (data.occupation === null) {
        entity.occupation = null;
      } else if (typeof data.occupation !== 'undefined') {
        entity.occupation = data.occupation;
      }
      if (data.searchName === null) {
        entity.searchName = null;
      } else if (typeof data.searchName !== 'undefined') {
        entity.searchName = data.searchName;
      }
      if (data.bio === null) {
        entity.bio = null;
      } else if (typeof data.bio !== 'undefined') {
        entity.bio = data.bio;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-profiles_11000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity ProfileEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.user === null && last.user === undefined) {
        diff.user = current.user;
      } else if (current.user == null && last.user == null) {
    
      } else if ((current.user != null && last.user == null) || (current.user == null && last.user != null)) {
        diff.user = current.user;
      } else if (last.user !== current.user) {
        diff.user = current.user;
      }
    
      if (current.handle === null && last.handle === undefined) {
        diff.handle = current.handle;
      } else if (current.handle == null && last.handle == null) {
    
      } else if ((current.handle != null && last.handle == null) || (current.handle == null && last.handle != null)) {
        diff.handle = current.handle;
      } else if (last.handle !== current.handle) {
        diff.handle = current.handle;
      }
    
      if (current.visibility === null && last.visibility === undefined) {
        diff.visibility = current.visibility;
      } else if (current.visibility == null && last.visibility == null) {
    
      } else if ((current.visibility != null && last.visibility == null) || (current.visibility == null && last.visibility != null)) {
        diff.visibility = current.visibility;
      } else if (last.visibility !== current.visibility) {
        diff.visibility = current.visibility;
      }
    
      if (current.iconImageId === null && last.iconImageId === undefined) {
        diff.iconImageId = current.iconImageId;
      } else if (current.iconImageId == null && last.iconImageId == null) {
    
      } else if ((current.iconImageId != null && last.iconImageId == null) || (current.iconImageId == null && last.iconImageId != null)) {
        diff.iconImageId = current.iconImageId;
      } else if (last.iconImageId !== current.iconImageId) {
        diff.iconImageId = current.iconImageId;
      }
    
      if (current.firstName === null && last.firstName === undefined) {
        diff.firstName = current.firstName;
      } else if (current.firstName == null && last.firstName == null) {
    
      } else if ((current.firstName != null && last.firstName == null) || (current.firstName == null && last.firstName != null)) {
        diff.firstName = current.firstName;
      } else if (last.firstName !== current.firstName) {
        diff.firstName = current.firstName;
      }
    
      if (current.lastName === null && last.lastName === undefined) {
        diff.lastName = current.lastName;
      } else if (current.lastName == null && last.lastName == null) {
    
      } else if ((current.lastName != null && last.lastName == null) || (current.lastName == null && last.lastName != null)) {
        diff.lastName = current.lastName;
      } else if (last.lastName !== current.lastName) {
        diff.lastName = current.lastName;
      }
    
      if (current.nameDisplayOrder === null && last.nameDisplayOrder === undefined) {
        diff.nameDisplayOrder = current.nameDisplayOrder;
      } else if (current.nameDisplayOrder == null && last.nameDisplayOrder == null) {
    
      } else if ((current.nameDisplayOrder != null && last.nameDisplayOrder == null) || (current.nameDisplayOrder == null && last.nameDisplayOrder != null)) {
        diff.nameDisplayOrder = current.nameDisplayOrder;
      } else if (last.nameDisplayOrder !== current.nameDisplayOrder) {
        diff.nameDisplayOrder = current.nameDisplayOrder;
      }
    
      if (current.occupation === null && last.occupation === undefined) {
        diff.occupation = current.occupation;
      } else if (current.occupation == null && last.occupation == null) {
    
      } else if ((current.occupation != null && last.occupation == null) || (current.occupation == null && last.occupation != null)) {
        diff.occupation = current.occupation;
      } else if (last.occupation !== current.occupation) {
        diff.occupation = current.occupation;
      }
    
      if (current.searchName === null && last.searchName === undefined) {
        diff.searchName = current.searchName;
      } else if (current.searchName == null && last.searchName == null) {
    
      } else if ((current.searchName != null && last.searchName == null) || (current.searchName == null && last.searchName != null)) {
        diff.searchName = current.searchName;
      } else if (last.searchName !== current.searchName) {
        diff.searchName = current.searchName;
      }
    
      if (current.bio === null && last.bio === undefined) {
        diff.bio = current.bio;
      } else if (current.bio == null && last.bio == null) {
    
      } else if ((current.bio != null && last.bio == null) || (current.bio == null && last.bio != null)) {
        diff.bio = current.bio;
      } else if (!equals(last.bio, current.bio)) {
        diff.bio = current.bio;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-profiles_11000': function(clone, cloneEmbeddable, toArray, EntityIdentifier, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.user !== 'undefined') {
        if (entity.user === null) {
          ret.user = null;
        } else if (entity.user?.__helper.__identifier && !entity.user.__helper.hasPrimaryKey()) {
          ret.user = entity.user?.__helper.__identifier;
        } else if (typeof entity.user !== 'undefined') {
          ret.user = toArray(entity.user.__helper.getPrimaryKey(true));
        }
      }
    
      if (typeof entity.handle !== 'undefined') {
        ret.handle = entity.handle;
      }
    
      if (typeof entity.visibility !== 'undefined') {
        ret.visibility = entity.visibility;
      }
    
      if (typeof entity.iconImageId !== 'undefined') {
        ret.iconImageId = entity.iconImageId;
      }
    
      if (typeof entity.firstName !== 'undefined') {
        ret.firstName = entity.firstName;
      }
    
      if (typeof entity.lastName !== 'undefined') {
        ret.lastName = entity.lastName;
      }
    
      if (typeof entity.nameDisplayOrder !== 'undefined') {
        ret.nameDisplayOrder = entity.nameDisplayOrder;
      }
    
      if (typeof entity.occupation !== 'undefined') {
        ret.occupation = entity.occupation;
      }
    
      if (typeof entity.searchName !== 'undefined') {
        ret.searchName = entity.searchName;
      }
    
      if (typeof entity.bio !== 'undefined') {
        ret.bio = clone(entity.bio);
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-profiles_11000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity ProfileEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.user_id !== 'undefined') {
        ret.user = result.user_id;
        mapped.user_id = true;
      }
      if (typeof result.handle !== 'undefined') {
        ret.handle = result.handle;
        mapped.handle = true;
      }
      if (typeof result.visibility !== 'undefined') {
        ret.visibility = result.visibility;
        mapped.visibility = true;
      }
      if (typeof result.icon_image_id !== 'undefined') {
        ret.iconImageId = result.icon_image_id;
        mapped.icon_image_id = true;
      }
      if (typeof result.first_name !== 'undefined') {
        ret.firstName = result.first_name;
        mapped.first_name = true;
      }
      if (typeof result.last_name !== 'undefined') {
        ret.lastName = result.last_name;
        mapped.last_name = true;
      }
      if (typeof result.name_display_order !== 'undefined') {
        ret.nameDisplayOrder = result.name_display_order;
        mapped.name_display_order = true;
      }
      if (typeof result.occupation !== 'undefined') {
        ret.occupation = result.occupation;
        mapped.occupation = true;
      }
      if (typeof result.search_name !== 'undefined') {
        ret.searchName = result.search_name;
        mapped.search_name = true;
      }
      if (typeof result.bio !== 'undefined') {
        ret.bio = result.bio;
        mapped.bio = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-profiles_11000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-profiles_11000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-profiles_11000': function(isEntityOrRef) {
    // compiled pk getter for entity ProfileEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-profiles_11000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity ProfileEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-profiles_11000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity ProfileEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-policies_9000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity PolicyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.type === null) {
        entity.type = null;
      } else if (typeof data.type !== 'undefined') {
        entity.type = data.type;
      }
      if (data.version === null) {
        entity.version = null;
      } else if (typeof data.version !== 'undefined') {
        entity.version = data.version;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.isPublished === null) {
        entity.isPublished = null;
      } else if (typeof data.isPublished !== 'undefined') {
        entity.isPublished = !!data.isPublished;
      }
      if (data.requiresReconsent === null) {
        entity.requiresReconsent = null;
      } else if (typeof data.requiresReconsent !== 'undefined') {
        entity.requiresReconsent = !!data.requiresReconsent;
      }
      if (data.effectiveDate === null) {
        entity.effectiveDate = null;
      } else if (typeof data.effectiveDate !== 'undefined') {
        if (data.effectiveDate instanceof Date) {
          entity.effectiveDate = data.effectiveDate;
        } else if (typeof data.effectiveDate === 'number' || data.effectiveDate.includes('+') || data.effectiveDate.lastIndexOf('-') > 10 || data.effectiveDate.endsWith('Z')) {
          entity.effectiveDate = new Date(data.effectiveDate);
        } else {
          entity.effectiveDate = new Date(data.effectiveDate + 'Z');
        }
      }
      if (data.editedBy === null) {
        entity.editedBy = null;
      } else if (typeof data.editedBy !== 'undefined') {
        entity.editedBy = data.editedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'hydrator-policies_9000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity PolicyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.type === null) {
        entity.type = null;
      } else if (typeof data.type !== 'undefined') {
        entity.type = data.type;
      }
      if (data.version === null) {
        entity.version = null;
      } else if (typeof data.version !== 'undefined') {
        entity.version = data.version;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.isPublished === null) {
        entity.isPublished = null;
      } else if (typeof data.isPublished !== 'undefined') {
        entity.isPublished = !!data.isPublished;
      }
      if (data.requiresReconsent === null) {
        entity.requiresReconsent = null;
      } else if (typeof data.requiresReconsent !== 'undefined') {
        entity.requiresReconsent = !!data.requiresReconsent;
      }
      if (data.effectiveDate === null) {
        entity.effectiveDate = null;
      } else if (typeof data.effectiveDate !== 'undefined') {
        if (data.effectiveDate instanceof Date) {
          entity.effectiveDate = data.effectiveDate;
        } else if (typeof data.effectiveDate === 'number' || data.effectiveDate.includes('+') || data.effectiveDate.lastIndexOf('-') > 10 || data.effectiveDate.endsWith('Z')) {
          entity.effectiveDate = new Date(data.effectiveDate);
        } else {
          entity.effectiveDate = new Date(data.effectiveDate + 'Z');
        }
      }
      if (data.editedBy === null) {
        entity.editedBy = null;
      } else if (typeof data.editedBy !== 'undefined') {
        entity.editedBy = data.editedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'comparator-policies_9000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity PolicyEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.type === null && last.type === undefined) {
        diff.type = current.type;
      } else if (current.type == null && last.type == null) {
    
      } else if ((current.type != null && last.type == null) || (current.type == null && last.type != null)) {
        diff.type = current.type;
      } else if (last.type !== current.type) {
        diff.type = current.type;
      }
    
      if (current.version === null && last.version === undefined) {
        diff.version = current.version;
      } else if (current.version == null && last.version == null) {
    
      } else if ((current.version != null && last.version == null) || (current.version == null && last.version != null)) {
        diff.version = current.version;
      } else if (!equals(last.version, current.version)) {
        diff.version = current.version;
      }
    
      if (current.bodyMarkdown === null && last.bodyMarkdown === undefined) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (current.bodyMarkdown == null && last.bodyMarkdown == null) {
    
      } else if ((current.bodyMarkdown != null && last.bodyMarkdown == null) || (current.bodyMarkdown == null && last.bodyMarkdown != null)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (!equals(last.bodyMarkdown, current.bodyMarkdown)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      }
    
      if (current.isPublished === null && last.isPublished === undefined) {
        diff.isPublished = current.isPublished;
      } else if (current.isPublished == null && last.isPublished == null) {
    
      } else if ((current.isPublished != null && last.isPublished == null) || (current.isPublished == null && last.isPublished != null)) {
        diff.isPublished = current.isPublished;
      } else if (!compareBooleans(last.isPublished, current.isPublished)) {
        diff.isPublished = current.isPublished;
      }
    
      if (current.requiresReconsent === null && last.requiresReconsent === undefined) {
        diff.requiresReconsent = current.requiresReconsent;
      } else if (current.requiresReconsent == null && last.requiresReconsent == null) {
    
      } else if ((current.requiresReconsent != null && last.requiresReconsent == null) || (current.requiresReconsent == null && last.requiresReconsent != null)) {
        diff.requiresReconsent = current.requiresReconsent;
      } else if (!compareBooleans(last.requiresReconsent, current.requiresReconsent)) {
        diff.requiresReconsent = current.requiresReconsent;
      }
    
      if (current.effectiveDate === null && last.effectiveDate === undefined) {
        diff.effectiveDate = current.effectiveDate;
      } else if (current.effectiveDate == null && last.effectiveDate == null) {
    
      } else if ((current.effectiveDate != null && last.effectiveDate == null) || (current.effectiveDate == null && last.effectiveDate != null)) {
        diff.effectiveDate = current.effectiveDate;
      } else if (!equals(last.effectiveDate, current.effectiveDate)) {
        diff.effectiveDate = current.effectiveDate;
      }
    
      if (current.editedBy === null && last.editedBy === undefined) {
        diff.editedBy = current.editedBy;
      } else if (current.editedBy == null && last.editedBy == null) {
    
      } else if ((current.editedBy != null && last.editedBy == null) || (current.editedBy == null && last.editedBy != null)) {
        diff.editedBy = current.editedBy;
      } else if (last.editedBy !== current.editedBy) {
        diff.editedBy = current.editedBy;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-policies_9000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.type !== 'undefined') {
        ret.type = entity.type;
      }
    
      if (typeof entity.version !== 'undefined') {
        ret.version = clone(entity.version);
      }
    
      if (typeof entity.bodyMarkdown !== 'undefined') {
        ret.bodyMarkdown = clone(entity.bodyMarkdown);
      }
    
      if (typeof entity.isPublished !== 'undefined') {
        ret.isPublished = entity.isPublished;
      }
    
      if (typeof entity.requiresReconsent !== 'undefined') {
        ret.requiresReconsent = entity.requiresReconsent;
      }
    
      if (typeof entity.effectiveDate !== 'undefined') {
        ret.effectiveDate = clone(processDateProperty(entity.effectiveDate));
      }
    
      if (typeof entity.editedBy !== 'undefined') {
        ret.editedBy = entity.editedBy;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      return ret;
    }
  },
  'resultMapper-policies_9000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity PolicyEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.type !== 'undefined') {
        ret.type = result.type;
        mapped.type = true;
      }
      if (typeof result.version !== 'undefined') {
        ret.version = result.version;
        mapped.version = true;
      }
      if (typeof result.body_markdown !== 'undefined') {
        ret.bodyMarkdown = result.body_markdown;
        mapped.body_markdown = true;
      }
      if (typeof result.is_published !== 'undefined') {
        ret.isPublished = result.is_published == null ? result.is_published : !!result.is_published;
        mapped.is_published = true;
      }
      if (typeof result.requires_reconsent !== 'undefined') {
        ret.requiresReconsent = result.requires_reconsent == null ? result.requires_reconsent : !!result.requires_reconsent;
        mapped.requires_reconsent = true;
      }
      if (typeof result.effective_date !== 'undefined') {
        if (result.effective_date == null || result.effective_date instanceof Date) {
          ret.effectiveDate = result.effective_date;
        } else if (typeof result.effective_date === 'bigint') {
          ret.effectiveDate = parseDate(Number(result.effective_date));
        } else if (typeof result.effective_date === 'number' || result.effective_date.includes('+') || result.effective_date.lastIndexOf('-') > 10 || result.effective_date.endsWith('Z')) {
          ret.effectiveDate = parseDate(result.effective_date);
        } else {
          ret.effectiveDate = parseDate(result.effective_date + 'Z');
        }
        mapped.effective_date = true;
      }
      if (typeof result.edited_by !== 'undefined') {
        ret.editedBy = result.edited_by;
        mapped.edited_by = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-policies_9000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity PolicyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-policies_9000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity PolicyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-policies_9000': function(isEntityOrRef) {
    // compiled pk getter for entity PolicyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-policies_9000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity PolicyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-policies_9000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity PolicyEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-inquiries_8000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity InquiryEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.category === null) {
        entity.category = null;
      } else if (typeof data.category !== 'undefined') {
        entity.category = data.category;
      }
      if (data.subject === null) {
        entity.subject = null;
      } else if (typeof data.subject !== 'undefined') {
        entity.subject = data.subject;
      }
      if (data.body === null) {
        entity.body = null;
      } else if (typeof data.body !== 'undefined') {
        entity.body = data.body;
      }
      if (data.contactEmail === null) {
        entity.contactEmail = null;
      } else if (typeof data.contactEmail !== 'undefined') {
        entity.contactEmail = data.contactEmail;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdByUserId === null) {
        entity.createdByUserId = null;
      } else if (typeof data.createdByUserId !== 'undefined') {
        entity.createdByUserId = data.createdByUserId;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-inquiries_8000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity InquiryEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.category === null) {
        entity.category = null;
      } else if (typeof data.category !== 'undefined') {
        entity.category = data.category;
      }
      if (data.subject === null) {
        entity.subject = null;
      } else if (typeof data.subject !== 'undefined') {
        entity.subject = data.subject;
      }
      if (data.body === null) {
        entity.body = null;
      } else if (typeof data.body !== 'undefined') {
        entity.body = data.body;
      }
      if (data.contactEmail === null) {
        entity.contactEmail = null;
      } else if (typeof data.contactEmail !== 'undefined') {
        entity.contactEmail = data.contactEmail;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdByUserId === null) {
        entity.createdByUserId = null;
      } else if (typeof data.createdByUserId !== 'undefined') {
        entity.createdByUserId = data.createdByUserId;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-inquiries_8000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity InquiryEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.category === null && last.category === undefined) {
        diff.category = current.category;
      } else if (current.category == null && last.category == null) {
    
      } else if ((current.category != null && last.category == null) || (current.category == null && last.category != null)) {
        diff.category = current.category;
      } else if (last.category !== current.category) {
        diff.category = current.category;
      }
    
      if (current.subject === null && last.subject === undefined) {
        diff.subject = current.subject;
      } else if (current.subject == null && last.subject == null) {
    
      } else if ((current.subject != null && last.subject == null) || (current.subject == null && last.subject != null)) {
        diff.subject = current.subject;
      } else if (last.subject !== current.subject) {
        diff.subject = current.subject;
      }
    
      if (current.body === null && last.body === undefined) {
        diff.body = current.body;
      } else if (current.body == null && last.body == null) {
    
      } else if ((current.body != null && last.body == null) || (current.body == null && last.body != null)) {
        diff.body = current.body;
      } else if (!equals(last.body, current.body)) {
        diff.body = current.body;
      }
    
      if (current.contactEmail === null && last.contactEmail === undefined) {
        diff.contactEmail = current.contactEmail;
      } else if (current.contactEmail == null && last.contactEmail == null) {
    
      } else if ((current.contactEmail != null && last.contactEmail == null) || (current.contactEmail == null && last.contactEmail != null)) {
        diff.contactEmail = current.contactEmail;
      } else if (last.contactEmail !== current.contactEmail) {
        diff.contactEmail = current.contactEmail;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.createdByUserId === null && last.createdByUserId === undefined) {
        diff.createdByUserId = current.createdByUserId;
      } else if (current.createdByUserId == null && last.createdByUserId == null) {
    
      } else if ((current.createdByUserId != null && last.createdByUserId == null) || (current.createdByUserId == null && last.createdByUserId != null)) {
        diff.createdByUserId = current.createdByUserId;
      } else if (last.createdByUserId !== current.createdByUserId) {
        diff.createdByUserId = current.createdByUserId;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-inquiries_8000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.category !== 'undefined') {
        ret.category = entity.category;
      }
    
      if (typeof entity.subject !== 'undefined') {
        ret.subject = entity.subject;
      }
    
      if (typeof entity.body !== 'undefined') {
        ret.body = clone(entity.body);
      }
    
      if (typeof entity.contactEmail !== 'undefined') {
        ret.contactEmail = entity.contactEmail;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.createdByUserId !== 'undefined') {
        ret.createdByUserId = entity.createdByUserId;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-inquiries_8000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity InquiryEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.category !== 'undefined') {
        ret.category = result.category;
        mapped.category = true;
      }
      if (typeof result.subject !== 'undefined') {
        ret.subject = result.subject;
        mapped.subject = true;
      }
      if (typeof result.body !== 'undefined') {
        ret.body = result.body;
        mapped.body = true;
      }
      if (typeof result.contact_email !== 'undefined') {
        ret.contactEmail = result.contact_email;
        mapped.contact_email = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.created_by_user_id !== 'undefined') {
        ret.createdByUserId = result.created_by_user_id;
        mapped.created_by_user_id = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-inquiries_8000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity InquiryEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-inquiries_8000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity InquiryEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-inquiries_8000': function(isEntityOrRef) {
    // compiled pk getter for entity InquiryEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-inquiries_8000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity InquiryEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-inquiries_8000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity InquiryEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-help_articles_7000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity HelpArticleEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.title === null) {
        entity.title = null;
      } else if (typeof data.title !== 'undefined') {
        entity.title = data.title;
      }
      if (data.slug === null) {
        entity.slug = null;
      } else if (typeof data.slug !== 'undefined') {
        entity.slug = data.slug;
      }
      if (data.category === null) {
        entity.category = null;
      } else if (typeof data.category !== 'undefined') {
        entity.category = data.category;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.updatedBy === null) {
        entity.updatedBy = null;
      } else if (typeof data.updatedBy !== 'undefined') {
        entity.updatedBy = data.updatedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-help_articles_7000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity HelpArticleEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.title === null) {
        entity.title = null;
      } else if (typeof data.title !== 'undefined') {
        entity.title = data.title;
      }
      if (data.slug === null) {
        entity.slug = null;
      } else if (typeof data.slug !== 'undefined') {
        entity.slug = data.slug;
      }
      if (data.category === null) {
        entity.category = null;
      } else if (typeof data.category !== 'undefined') {
        entity.category = data.category;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.updatedBy === null) {
        entity.updatedBy = null;
      } else if (typeof data.updatedBy !== 'undefined') {
        entity.updatedBy = data.updatedBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-help_articles_7000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity HelpArticleEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.title === null && last.title === undefined) {
        diff.title = current.title;
      } else if (current.title == null && last.title == null) {
    
      } else if ((current.title != null && last.title == null) || (current.title == null && last.title != null)) {
        diff.title = current.title;
      } else if (last.title !== current.title) {
        diff.title = current.title;
      }
    
      if (current.slug === null && last.slug === undefined) {
        diff.slug = current.slug;
      } else if (current.slug == null && last.slug == null) {
    
      } else if ((current.slug != null && last.slug == null) || (current.slug == null && last.slug != null)) {
        diff.slug = current.slug;
      } else if (last.slug !== current.slug) {
        diff.slug = current.slug;
      }
    
      if (current.category === null && last.category === undefined) {
        diff.category = current.category;
      } else if (current.category == null && last.category == null) {
    
      } else if ((current.category != null && last.category == null) || (current.category == null && last.category != null)) {
        diff.category = current.category;
      } else if (last.category !== current.category) {
        diff.category = current.category;
      }
    
      if (current.bodyMarkdown === null && last.bodyMarkdown === undefined) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (current.bodyMarkdown == null && last.bodyMarkdown == null) {
    
      } else if ((current.bodyMarkdown != null && last.bodyMarkdown == null) || (current.bodyMarkdown == null && last.bodyMarkdown != null)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (!equals(last.bodyMarkdown, current.bodyMarkdown)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.updatedBy === null && last.updatedBy === undefined) {
        diff.updatedBy = current.updatedBy;
      } else if (current.updatedBy == null && last.updatedBy == null) {
    
      } else if ((current.updatedBy != null && last.updatedBy == null) || (current.updatedBy == null && last.updatedBy != null)) {
        diff.updatedBy = current.updatedBy;
      } else if (last.updatedBy !== current.updatedBy) {
        diff.updatedBy = current.updatedBy;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-help_articles_7000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.title !== 'undefined') {
        ret.title = entity.title;
      }
    
      if (typeof entity.slug !== 'undefined') {
        ret.slug = entity.slug;
      }
    
      if (typeof entity.category !== 'undefined') {
        ret.category = entity.category;
      }
    
      if (typeof entity.bodyMarkdown !== 'undefined') {
        ret.bodyMarkdown = clone(entity.bodyMarkdown);
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.updatedBy !== 'undefined') {
        ret.updatedBy = entity.updatedBy;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-help_articles_7000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity HelpArticleEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.title !== 'undefined') {
        ret.title = result.title;
        mapped.title = true;
      }
      if (typeof result.slug !== 'undefined') {
        ret.slug = result.slug;
        mapped.slug = true;
      }
      if (typeof result.category !== 'undefined') {
        ret.category = result.category;
        mapped.category = true;
      }
      if (typeof result.body_markdown !== 'undefined') {
        ret.bodyMarkdown = result.body_markdown;
        mapped.body_markdown = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.updated_by !== 'undefined') {
        ret.updatedBy = result.updated_by;
        mapped.updated_by = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-help_articles_7000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity HelpArticleEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-help_articles_7000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity HelpArticleEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-help_articles_7000': function(isEntityOrRef) {
    // compiled pk getter for entity HelpArticleEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-help_articles_7000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity HelpArticleEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-help_articles_7000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity HelpArticleEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-email_notifications_6000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity EmailNotificationEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.subject === null) {
        entity.subject = null;
      } else if (typeof data.subject !== 'undefined') {
        entity.subject = data.subject;
      }
      if (data.templateKey === null) {
        entity.templateKey = null;
      } else if (typeof data.templateKey !== 'undefined') {
        entity.templateKey = data.templateKey;
      }
      if (data.targetCondition === null) {
        entity.targetCondition = null;
      } else if (typeof data.targetCondition !== 'undefined') {
        entity.targetCondition = data.targetCondition;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdBy === null) {
        entity.createdBy = null;
      } else if (typeof data.createdBy !== 'undefined') {
        entity.createdBy = data.createdBy;
      }
      if (data.sentAt === null) {
        entity.sentAt = null;
      } else if (typeof data.sentAt !== 'undefined') {
        if (data.sentAt instanceof Date) {
          entity.sentAt = data.sentAt;
        } else if (typeof data.sentAt === 'number' || data.sentAt.includes('+') || data.sentAt.lastIndexOf('-') > 10 || data.sentAt.endsWith('Z')) {
          entity.sentAt = new Date(data.sentAt);
        } else {
          entity.sentAt = new Date(data.sentAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'hydrator-email_notifications_6000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity EmailNotificationEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.subject === null) {
        entity.subject = null;
      } else if (typeof data.subject !== 'undefined') {
        entity.subject = data.subject;
      }
      if (data.templateKey === null) {
        entity.templateKey = null;
      } else if (typeof data.templateKey !== 'undefined') {
        entity.templateKey = data.templateKey;
      }
      if (data.targetCondition === null) {
        entity.targetCondition = null;
      } else if (typeof data.targetCondition !== 'undefined') {
        entity.targetCondition = data.targetCondition;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdBy === null) {
        entity.createdBy = null;
      } else if (typeof data.createdBy !== 'undefined') {
        entity.createdBy = data.createdBy;
      }
      if (data.sentAt === null) {
        entity.sentAt = null;
      } else if (typeof data.sentAt !== 'undefined') {
        if (data.sentAt instanceof Date) {
          entity.sentAt = data.sentAt;
        } else if (typeof data.sentAt === 'number' || data.sentAt.includes('+') || data.sentAt.lastIndexOf('-') > 10 || data.sentAt.endsWith('Z')) {
          entity.sentAt = new Date(data.sentAt);
        } else {
          entity.sentAt = new Date(data.sentAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'comparator-email_notifications_6000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity EmailNotificationEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.subject === null && last.subject === undefined) {
        diff.subject = current.subject;
      } else if (current.subject == null && last.subject == null) {
    
      } else if ((current.subject != null && last.subject == null) || (current.subject == null && last.subject != null)) {
        diff.subject = current.subject;
      } else if (last.subject !== current.subject) {
        diff.subject = current.subject;
      }
    
      if (current.templateKey === null && last.templateKey === undefined) {
        diff.templateKey = current.templateKey;
      } else if (current.templateKey == null && last.templateKey == null) {
    
      } else if ((current.templateKey != null && last.templateKey == null) || (current.templateKey == null && last.templateKey != null)) {
        diff.templateKey = current.templateKey;
      } else if (last.templateKey !== current.templateKey) {
        diff.templateKey = current.templateKey;
      }
    
      if (current.targetCondition === null && last.targetCondition === undefined) {
        diff.targetCondition = current.targetCondition;
      } else if (current.targetCondition == null && last.targetCondition == null) {
    
      } else if ((current.targetCondition != null && last.targetCondition == null) || (current.targetCondition == null && last.targetCondition != null)) {
        diff.targetCondition = current.targetCondition;
      } else if (last.targetCondition !== current.targetCondition) {
        diff.targetCondition = current.targetCondition;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.createdBy === null && last.createdBy === undefined) {
        diff.createdBy = current.createdBy;
      } else if (current.createdBy == null && last.createdBy == null) {
    
      } else if ((current.createdBy != null && last.createdBy == null) || (current.createdBy == null && last.createdBy != null)) {
        diff.createdBy = current.createdBy;
      } else if (last.createdBy !== current.createdBy) {
        diff.createdBy = current.createdBy;
      }
    
      if (current.sentAt === null && last.sentAt === undefined) {
        diff.sentAt = current.sentAt;
      } else if (current.sentAt == null && last.sentAt == null) {
    
      } else if ((current.sentAt != null && last.sentAt == null) || (current.sentAt == null && last.sentAt != null)) {
        diff.sentAt = current.sentAt;
      } else if (!equals(last.sentAt, current.sentAt)) {
        diff.sentAt = current.sentAt;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-email_notifications_6000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.subject !== 'undefined') {
        ret.subject = entity.subject;
      }
    
      if (typeof entity.templateKey !== 'undefined') {
        ret.templateKey = entity.templateKey;
      }
    
      if (typeof entity.targetCondition !== 'undefined') {
        ret.targetCondition = entity.targetCondition;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.createdBy !== 'undefined') {
        ret.createdBy = entity.createdBy;
      }
    
      if (typeof entity.sentAt !== 'undefined') {
        ret.sentAt = clone(processDateProperty(entity.sentAt));
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      return ret;
    }
  },
  'resultMapper-email_notifications_6000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity EmailNotificationEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.subject !== 'undefined') {
        ret.subject = result.subject;
        mapped.subject = true;
      }
      if (typeof result.template_key !== 'undefined') {
        ret.templateKey = result.template_key;
        mapped.template_key = true;
      }
      if (typeof result.target_condition !== 'undefined') {
        ret.targetCondition = result.target_condition;
        mapped.target_condition = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.created_by !== 'undefined') {
        ret.createdBy = result.created_by;
        mapped.created_by = true;
      }
      if (typeof result.sent_at !== 'undefined') {
        if (result.sent_at == null || result.sent_at instanceof Date) {
          ret.sentAt = result.sent_at;
        } else if (typeof result.sent_at === 'bigint') {
          ret.sentAt = parseDate(Number(result.sent_at));
        } else if (typeof result.sent_at === 'number' || result.sent_at.includes('+') || result.sent_at.lastIndexOf('-') > 10 || result.sent_at.endsWith('Z')) {
          ret.sentAt = parseDate(result.sent_at);
        } else {
          ret.sentAt = parseDate(result.sent_at + 'Z');
        }
        mapped.sent_at = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-email_notifications_6000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity EmailNotificationEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-email_notifications_6000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity EmailNotificationEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-email_notifications_6000': function(isEntityOrRef) {
    // compiled pk getter for entity EmailNotificationEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-email_notifications_6000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity EmailNotificationEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-email_notifications_6000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity EmailNotificationEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-audit_logs_5000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AuditLogEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.eventType === null) {
        entity.eventType = null;
      } else if (typeof data.eventType !== 'undefined') {
        entity.eventType = data.eventType;
      }
      if (data.actorType === null) {
        entity.actorType = null;
      } else if (typeof data.actorType !== 'undefined') {
        entity.actorType = data.actorType;
      }
      if (data.actorId === null) {
        entity.actorId = null;
      } else if (typeof data.actorId !== 'undefined') {
        entity.actorId = data.actorId;
      }
      if (data.targetType === null) {
        entity.targetType = null;
      } else if (typeof data.targetType !== 'undefined') {
        entity.targetType = data.targetType;
      }
      if (data.targetId === null) {
        entity.targetId = null;
      } else if (typeof data.targetId !== 'undefined') {
        entity.targetId = data.targetId;
      }
      if (data.result === null) {
        entity.result = null;
      } else if (typeof data.result !== 'undefined') {
        entity.result = data.result;
      }
      if (data.metadata === null) {
        entity.metadata = null;
      } else if (typeof data.metadata !== 'undefined') {
        entity.metadata = data.metadata;
      }
      if (data.occurredAt === null) {
        entity.occurredAt = null;
      } else if (typeof data.occurredAt !== 'undefined') {
        if (data.occurredAt instanceof Date) {
          entity.occurredAt = data.occurredAt;
        } else if (typeof data.occurredAt === 'number' || data.occurredAt.includes('+') || data.occurredAt.lastIndexOf('-') > 10 || data.occurredAt.endsWith('Z')) {
          entity.occurredAt = new Date(data.occurredAt);
        } else {
          entity.occurredAt = new Date(data.occurredAt + 'Z');
        }
      }
    }
  },
  'hydrator-audit_logs_5000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AuditLogEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.eventType === null) {
        entity.eventType = null;
      } else if (typeof data.eventType !== 'undefined') {
        entity.eventType = data.eventType;
      }
      if (data.actorType === null) {
        entity.actorType = null;
      } else if (typeof data.actorType !== 'undefined') {
        entity.actorType = data.actorType;
      }
      if (data.actorId === null) {
        entity.actorId = null;
      } else if (typeof data.actorId !== 'undefined') {
        entity.actorId = data.actorId;
      }
      if (data.targetType === null) {
        entity.targetType = null;
      } else if (typeof data.targetType !== 'undefined') {
        entity.targetType = data.targetType;
      }
      if (data.targetId === null) {
        entity.targetId = null;
      } else if (typeof data.targetId !== 'undefined') {
        entity.targetId = data.targetId;
      }
      if (data.result === null) {
        entity.result = null;
      } else if (typeof data.result !== 'undefined') {
        entity.result = data.result;
      }
      if (data.metadata === null) {
        entity.metadata = null;
      } else if (typeof data.metadata !== 'undefined') {
        entity.metadata = data.metadata;
      }
      if (data.occurredAt === null) {
        entity.occurredAt = null;
      } else if (typeof data.occurredAt !== 'undefined') {
        if (data.occurredAt instanceof Date) {
          entity.occurredAt = data.occurredAt;
        } else if (typeof data.occurredAt === 'number' || data.occurredAt.includes('+') || data.occurredAt.lastIndexOf('-') > 10 || data.occurredAt.endsWith('Z')) {
          entity.occurredAt = new Date(data.occurredAt);
        } else {
          entity.occurredAt = new Date(data.occurredAt + 'Z');
        }
      }
    }
  },
  'comparator-audit_logs_5000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity AuditLogEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.eventType === null && last.eventType === undefined) {
        diff.eventType = current.eventType;
      } else if (current.eventType == null && last.eventType == null) {
    
      } else if ((current.eventType != null && last.eventType == null) || (current.eventType == null && last.eventType != null)) {
        diff.eventType = current.eventType;
      } else if (last.eventType !== current.eventType) {
        diff.eventType = current.eventType;
      }
    
      if (current.actorType === null && last.actorType === undefined) {
        diff.actorType = current.actorType;
      } else if (current.actorType == null && last.actorType == null) {
    
      } else if ((current.actorType != null && last.actorType == null) || (current.actorType == null && last.actorType != null)) {
        diff.actorType = current.actorType;
      } else if (last.actorType !== current.actorType) {
        diff.actorType = current.actorType;
      }
    
      if (current.actorId === null && last.actorId === undefined) {
        diff.actorId = current.actorId;
      } else if (current.actorId == null && last.actorId == null) {
    
      } else if ((current.actorId != null && last.actorId == null) || (current.actorId == null && last.actorId != null)) {
        diff.actorId = current.actorId;
      } else if (last.actorId !== current.actorId) {
        diff.actorId = current.actorId;
      }
    
      if (current.targetType === null && last.targetType === undefined) {
        diff.targetType = current.targetType;
      } else if (current.targetType == null && last.targetType == null) {
    
      } else if ((current.targetType != null && last.targetType == null) || (current.targetType == null && last.targetType != null)) {
        diff.targetType = current.targetType;
      } else if (last.targetType !== current.targetType) {
        diff.targetType = current.targetType;
      }
    
      if (current.targetId === null && last.targetId === undefined) {
        diff.targetId = current.targetId;
      } else if (current.targetId == null && last.targetId == null) {
    
      } else if ((current.targetId != null && last.targetId == null) || (current.targetId == null && last.targetId != null)) {
        diff.targetId = current.targetId;
      } else if (last.targetId !== current.targetId) {
        diff.targetId = current.targetId;
      }
    
      if (current.result === null && last.result === undefined) {
        diff.result = current.result;
      } else if (current.result == null && last.result == null) {
    
      } else if ((current.result != null && last.result == null) || (current.result == null && last.result != null)) {
        diff.result = current.result;
      } else if (last.result !== current.result) {
        diff.result = current.result;
      }
    
      if (current.metadata === null && last.metadata === undefined) {
        diff.metadata = current.metadata;
      } else if (current.metadata == null && last.metadata == null) {
    
      } else if ((current.metadata != null && last.metadata == null) || (current.metadata == null && last.metadata != null)) {
        diff.metadata = current.metadata;
      } else if (!equals(last.metadata, current.metadata)) {
        diff.metadata = current.metadata;
      }
    
      if (current.occurredAt === null && last.occurredAt === undefined) {
        diff.occurredAt = current.occurredAt;
      } else if (current.occurredAt == null && last.occurredAt == null) {
    
      } else if ((current.occurredAt != null && last.occurredAt == null) || (current.occurredAt == null && last.occurredAt != null)) {
        diff.occurredAt = current.occurredAt;
      } else if (!equals(last.occurredAt, current.occurredAt)) {
        diff.occurredAt = current.occurredAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-audit_logs_5000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.eventType !== 'undefined') {
        ret.eventType = entity.eventType;
      }
    
      if (typeof entity.actorType !== 'undefined') {
        ret.actorType = entity.actorType;
      }
    
      if (typeof entity.actorId !== 'undefined') {
        ret.actorId = entity.actorId;
      }
    
      if (typeof entity.targetType !== 'undefined') {
        ret.targetType = entity.targetType;
      }
    
      if (typeof entity.targetId !== 'undefined') {
        ret.targetId = entity.targetId;
      }
    
      if (typeof entity.result !== 'undefined') {
        ret.result = entity.result;
      }
    
      if (typeof entity.metadata !== 'undefined') {
        ret.metadata = clone(entity.metadata);
      }
    
      if (typeof entity.occurredAt !== 'undefined') {
        ret.occurredAt = clone(processDateProperty(entity.occurredAt));
      }
    
      return ret;
    }
  },
  'resultMapper-audit_logs_5000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity AuditLogEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.event_type !== 'undefined') {
        ret.eventType = result.event_type;
        mapped.event_type = true;
      }
      if (typeof result.actor_type !== 'undefined') {
        ret.actorType = result.actor_type;
        mapped.actor_type = true;
      }
      if (typeof result.actor_id !== 'undefined') {
        ret.actorId = result.actor_id;
        mapped.actor_id = true;
      }
      if (typeof result.target_type !== 'undefined') {
        ret.targetType = result.target_type;
        mapped.target_type = true;
      }
      if (typeof result.target_id !== 'undefined') {
        ret.targetId = result.target_id;
        mapped.target_id = true;
      }
      if (typeof result.result !== 'undefined') {
        ret.result = result.result;
        mapped.result = true;
      }
      if (typeof result.metadata !== 'undefined') {
        ret.metadata = result.metadata;
        mapped.metadata = true;
      }
      if (typeof result.occurred_at !== 'undefined') {
        if (result.occurred_at == null || result.occurred_at instanceof Date) {
          ret.occurredAt = result.occurred_at;
        } else if (typeof result.occurred_at === 'bigint') {
          ret.occurredAt = parseDate(Number(result.occurred_at));
        } else if (typeof result.occurred_at === 'number' || result.occurred_at.includes('+') || result.occurred_at.lastIndexOf('-') > 10 || result.occurred_at.endsWith('Z')) {
          ret.occurredAt = parseDate(result.occurred_at);
        } else {
          ret.occurredAt = parseDate(result.occurred_at + 'Z');
        }
        mapped.occurred_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-audit_logs_5000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AuditLogEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-audit_logs_5000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AuditLogEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-audit_logs_5000': function(isEntityOrRef) {
    // compiled pk getter for entity AuditLogEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-audit_logs_5000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AuditLogEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-audit_logs_5000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AuditLogEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-app_settings_4000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
      if (data.value === null) {
        entity.value = null;
      } else if (typeof data.value !== 'undefined') {
        entity.value = data.value;
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-app_settings_4000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
      if (data.value === null) {
        entity.value = null;
      } else if (typeof data.value !== 'undefined') {
        entity.value = data.value;
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-app_settings_4000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity AppSettingEntity
    return function(last, current, options) {
      const diff = {};
      if (current.key === null && last.key === undefined) {
        diff.key = current.key;
      } else if (current.key == null && last.key == null) {
    
      } else if ((current.key != null && last.key == null) || (current.key == null && last.key != null)) {
        diff.key = current.key;
      } else if (last.key !== current.key) {
        diff.key = current.key;
      }
    
      if (current.value === null && last.value === undefined) {
        diff.value = current.value;
      } else if (current.value == null && last.value == null) {
    
      } else if ((current.value != null && last.value == null) || (current.value == null && last.value != null)) {
        diff.value = current.value;
      } else if (last.value !== current.value) {
        diff.value = current.value;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-app_settings_4000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.key !== 'undefined') {
        ret.key = entity.key;
      }
    
      if (typeof entity.value !== 'undefined') {
        ret.value = entity.value;
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-app_settings_4000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity AppSettingEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.key !== 'undefined') {
        ret.key = result.key;
        mapped.key = true;
      }
      if (typeof result.value !== 'undefined') {
        ret.value = result.value;
        mapped.value = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-app_settings_4000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
    }
  },
  'hydrator-app_settings_4000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
    }
  },
  'pkGetter-app_settings_4000': function(isEntityOrRef) {
    // compiled pk getter for entity AppSettingEntity
    return function(entity) {
      return entity.key;
    }
  },
  'pkGetterConverted-app_settings_4000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AppSettingEntity
    return function(entity) {
      return entity.key;
    }
  },
  'pkSerializer-app_settings_4000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AppSettingEntity
    return function(entity) {
      return '' + entity.key;
    }
  },
  'hydrator-api_keys_3000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.keyHash === null) {
        entity.keyHash = null;
      } else if (typeof data.keyHash !== 'undefined') {
        entity.keyHash = data.keyHash;
      }
      if (data.label === null) {
        entity.label = null;
      } else if (typeof data.label !== 'undefined') {
        entity.label = data.label;
      }
      if (data.scope === null) {
        entity.scope = null;
      } else if (typeof data.scope !== 'undefined') {
        entity.scope = data.scope;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.lastUsedAt === null) {
        entity.lastUsedAt = null;
      } else if (typeof data.lastUsedAt !== 'undefined') {
        if (data.lastUsedAt instanceof Date) {
          entity.lastUsedAt = data.lastUsedAt;
        } else if (typeof data.lastUsedAt === 'number' || data.lastUsedAt.includes('+') || data.lastUsedAt.lastIndexOf('-') > 10 || data.lastUsedAt.endsWith('Z')) {
          entity.lastUsedAt = new Date(data.lastUsedAt);
        } else {
          entity.lastUsedAt = new Date(data.lastUsedAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.revokedAt === null) {
        entity.revokedAt = null;
      } else if (typeof data.revokedAt !== 'undefined') {
        if (data.revokedAt instanceof Date) {
          entity.revokedAt = data.revokedAt;
        } else if (typeof data.revokedAt === 'number' || data.revokedAt.includes('+') || data.revokedAt.lastIndexOf('-') > 10 || data.revokedAt.endsWith('Z')) {
          entity.revokedAt = new Date(data.revokedAt);
        } else {
          entity.revokedAt = new Date(data.revokedAt + 'Z');
        }
      }
    }
  },
  'hydrator-api_keys_3000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.userId === null) {
        entity.userId = null;
      } else if (typeof data.userId !== 'undefined') {
        entity.userId = data.userId;
      }
      if (data.keyHash === null) {
        entity.keyHash = null;
      } else if (typeof data.keyHash !== 'undefined') {
        entity.keyHash = data.keyHash;
      }
      if (data.label === null) {
        entity.label = null;
      } else if (typeof data.label !== 'undefined') {
        entity.label = data.label;
      }
      if (data.scope === null) {
        entity.scope = null;
      } else if (typeof data.scope !== 'undefined') {
        entity.scope = data.scope;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.lastUsedAt === null) {
        entity.lastUsedAt = null;
      } else if (typeof data.lastUsedAt !== 'undefined') {
        if (data.lastUsedAt instanceof Date) {
          entity.lastUsedAt = data.lastUsedAt;
        } else if (typeof data.lastUsedAt === 'number' || data.lastUsedAt.includes('+') || data.lastUsedAt.lastIndexOf('-') > 10 || data.lastUsedAt.endsWith('Z')) {
          entity.lastUsedAt = new Date(data.lastUsedAt);
        } else {
          entity.lastUsedAt = new Date(data.lastUsedAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.revokedAt === null) {
        entity.revokedAt = null;
      } else if (typeof data.revokedAt !== 'undefined') {
        if (data.revokedAt instanceof Date) {
          entity.revokedAt = data.revokedAt;
        } else if (typeof data.revokedAt === 'number' || data.revokedAt.includes('+') || data.revokedAt.lastIndexOf('-') > 10 || data.revokedAt.endsWith('Z')) {
          entity.revokedAt = new Date(data.revokedAt);
        } else {
          entity.revokedAt = new Date(data.revokedAt + 'Z');
        }
      }
    }
  },
  'comparator-api_keys_3000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity ApiKeyEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.userId === null && last.userId === undefined) {
        diff.userId = current.userId;
      } else if (current.userId == null && last.userId == null) {
    
      } else if ((current.userId != null && last.userId == null) || (current.userId == null && last.userId != null)) {
        diff.userId = current.userId;
      } else if (last.userId !== current.userId) {
        diff.userId = current.userId;
      }
    
      if (current.keyHash === null && last.keyHash === undefined) {
        diff.keyHash = current.keyHash;
      } else if (current.keyHash == null && last.keyHash == null) {
    
      } else if ((current.keyHash != null && last.keyHash == null) || (current.keyHash == null && last.keyHash != null)) {
        diff.keyHash = current.keyHash;
      } else if (last.keyHash !== current.keyHash) {
        diff.keyHash = current.keyHash;
      }
    
      if (current.label === null && last.label === undefined) {
        diff.label = current.label;
      } else if (current.label == null && last.label == null) {
    
      } else if ((current.label != null && last.label == null) || (current.label == null && last.label != null)) {
        diff.label = current.label;
      } else if (last.label !== current.label) {
        diff.label = current.label;
      }
    
      if (current.scope === null && last.scope === undefined) {
        diff.scope = current.scope;
      } else if (current.scope == null && last.scope == null) {
    
      } else if ((current.scope != null && last.scope == null) || (current.scope == null && last.scope != null)) {
        diff.scope = current.scope;
      } else if (last.scope !== current.scope) {
        diff.scope = current.scope;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.lastUsedAt === null && last.lastUsedAt === undefined) {
        diff.lastUsedAt = current.lastUsedAt;
      } else if (current.lastUsedAt == null && last.lastUsedAt == null) {
    
      } else if ((current.lastUsedAt != null && last.lastUsedAt == null) || (current.lastUsedAt == null && last.lastUsedAt != null)) {
        diff.lastUsedAt = current.lastUsedAt;
      } else if (!equals(last.lastUsedAt, current.lastUsedAt)) {
        diff.lastUsedAt = current.lastUsedAt;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.revokedAt === null && last.revokedAt === undefined) {
        diff.revokedAt = current.revokedAt;
      } else if (current.revokedAt == null && last.revokedAt == null) {
    
      } else if ((current.revokedAt != null && last.revokedAt == null) || (current.revokedAt == null && last.revokedAt != null)) {
        diff.revokedAt = current.revokedAt;
      } else if (!equals(last.revokedAt, current.revokedAt)) {
        diff.revokedAt = current.revokedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-api_keys_3000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.userId !== 'undefined') {
        ret.userId = entity.userId;
      }
    
      if (typeof entity.keyHash !== 'undefined') {
        ret.keyHash = entity.keyHash;
      }
    
      if (typeof entity.label !== 'undefined') {
        ret.label = entity.label;
      }
    
      if (typeof entity.scope !== 'undefined') {
        ret.scope = entity.scope;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.lastUsedAt !== 'undefined') {
        ret.lastUsedAt = clone(processDateProperty(entity.lastUsedAt));
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.revokedAt !== 'undefined') {
        ret.revokedAt = clone(processDateProperty(entity.revokedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-api_keys_3000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity ApiKeyEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.user_id !== 'undefined') {
        ret.userId = result.user_id;
        mapped.user_id = true;
      }
      if (typeof result.key_hash !== 'undefined') {
        ret.keyHash = result.key_hash;
        mapped.key_hash = true;
      }
      if (typeof result.label !== 'undefined') {
        ret.label = result.label;
        mapped.label = true;
      }
      if (typeof result.scope !== 'undefined') {
        ret.scope = result.scope;
        mapped.scope = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.last_used_at !== 'undefined') {
        if (result.last_used_at == null || result.last_used_at instanceof Date) {
          ret.lastUsedAt = result.last_used_at;
        } else if (typeof result.last_used_at === 'bigint') {
          ret.lastUsedAt = parseDate(Number(result.last_used_at));
        } else if (typeof result.last_used_at === 'number' || result.last_used_at.includes('+') || result.last_used_at.lastIndexOf('-') > 10 || result.last_used_at.endsWith('Z')) {
          ret.lastUsedAt = parseDate(result.last_used_at);
        } else {
          ret.lastUsedAt = parseDate(result.last_used_at + 'Z');
        }
        mapped.last_used_at = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.revoked_at !== 'undefined') {
        if (result.revoked_at == null || result.revoked_at instanceof Date) {
          ret.revokedAt = result.revoked_at;
        } else if (typeof result.revoked_at === 'bigint') {
          ret.revokedAt = parseDate(Number(result.revoked_at));
        } else if (typeof result.revoked_at === 'number' || result.revoked_at.includes('+') || result.revoked_at.lastIndexOf('-') > 10 || result.revoked_at.endsWith('Z')) {
          ret.revokedAt = parseDate(result.revoked_at);
        } else {
          ret.revokedAt = parseDate(result.revoked_at + 'Z');
        }
        mapped.revoked_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-api_keys_3000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-api_keys_3000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-api_keys_3000': function(isEntityOrRef) {
    // compiled pk getter for entity ApiKeyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-api_keys_3000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity ApiKeyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-api_keys_3000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity ApiKeyEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-announcements_2000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AnnouncementEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.title === null) {
        entity.title = null;
      } else if (typeof data.title !== 'undefined') {
        entity.title = data.title;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.importance === null) {
        entity.importance = null;
      } else if (typeof data.importance !== 'undefined') {
        entity.importance = data.importance;
      }
      if (data.publishStartAt === null) {
        entity.publishStartAt = null;
      } else if (typeof data.publishStartAt !== 'undefined') {
        if (data.publishStartAt instanceof Date) {
          entity.publishStartAt = data.publishStartAt;
        } else if (typeof data.publishStartAt === 'number' || data.publishStartAt.includes('+') || data.publishStartAt.lastIndexOf('-') > 10 || data.publishStartAt.endsWith('Z')) {
          entity.publishStartAt = new Date(data.publishStartAt);
        } else {
          entity.publishStartAt = new Date(data.publishStartAt + 'Z');
        }
      }
      if (data.publishEndAt === null) {
        entity.publishEndAt = null;
      } else if (typeof data.publishEndAt !== 'undefined') {
        if (data.publishEndAt instanceof Date) {
          entity.publishEndAt = data.publishEndAt;
        } else if (typeof data.publishEndAt === 'number' || data.publishEndAt.includes('+') || data.publishEndAt.lastIndexOf('-') > 10 || data.publishEndAt.endsWith('Z')) {
          entity.publishEndAt = new Date(data.publishEndAt);
        } else {
          entity.publishEndAt = new Date(data.publishEndAt + 'Z');
        }
      }
      if (data.createdBy === null) {
        entity.createdBy = null;
      } else if (typeof data.createdBy !== 'undefined') {
        entity.createdBy = data.createdBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-announcements_2000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AnnouncementEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.title === null) {
        entity.title = null;
      } else if (typeof data.title !== 'undefined') {
        entity.title = data.title;
      }
      if (data.bodyMarkdown === null) {
        entity.bodyMarkdown = null;
      } else if (typeof data.bodyMarkdown !== 'undefined') {
        entity.bodyMarkdown = data.bodyMarkdown;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.importance === null) {
        entity.importance = null;
      } else if (typeof data.importance !== 'undefined') {
        entity.importance = data.importance;
      }
      if (data.publishStartAt === null) {
        entity.publishStartAt = null;
      } else if (typeof data.publishStartAt !== 'undefined') {
        if (data.publishStartAt instanceof Date) {
          entity.publishStartAt = data.publishStartAt;
        } else if (typeof data.publishStartAt === 'number' || data.publishStartAt.includes('+') || data.publishStartAt.lastIndexOf('-') > 10 || data.publishStartAt.endsWith('Z')) {
          entity.publishStartAt = new Date(data.publishStartAt);
        } else {
          entity.publishStartAt = new Date(data.publishStartAt + 'Z');
        }
      }
      if (data.publishEndAt === null) {
        entity.publishEndAt = null;
      } else if (typeof data.publishEndAt !== 'undefined') {
        if (data.publishEndAt instanceof Date) {
          entity.publishEndAt = data.publishEndAt;
        } else if (typeof data.publishEndAt === 'number' || data.publishEndAt.includes('+') || data.publishEndAt.lastIndexOf('-') > 10 || data.publishEndAt.endsWith('Z')) {
          entity.publishEndAt = new Date(data.publishEndAt);
        } else {
          entity.publishEndAt = new Date(data.publishEndAt + 'Z');
        }
      }
      if (data.createdBy === null) {
        entity.createdBy = null;
      } else if (typeof data.createdBy !== 'undefined') {
        entity.createdBy = data.createdBy;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-announcements_2000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity AnnouncementEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.title === null && last.title === undefined) {
        diff.title = current.title;
      } else if (current.title == null && last.title == null) {
    
      } else if ((current.title != null && last.title == null) || (current.title == null && last.title != null)) {
        diff.title = current.title;
      } else if (last.title !== current.title) {
        diff.title = current.title;
      }
    
      if (current.bodyMarkdown === null && last.bodyMarkdown === undefined) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (current.bodyMarkdown == null && last.bodyMarkdown == null) {
    
      } else if ((current.bodyMarkdown != null && last.bodyMarkdown == null) || (current.bodyMarkdown == null && last.bodyMarkdown != null)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      } else if (!equals(last.bodyMarkdown, current.bodyMarkdown)) {
        diff.bodyMarkdown = current.bodyMarkdown;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.importance === null && last.importance === undefined) {
        diff.importance = current.importance;
      } else if (current.importance == null && last.importance == null) {
    
      } else if ((current.importance != null && last.importance == null) || (current.importance == null && last.importance != null)) {
        diff.importance = current.importance;
      } else if (last.importance !== current.importance) {
        diff.importance = current.importance;
      }
    
      if (current.publishStartAt === null && last.publishStartAt === undefined) {
        diff.publishStartAt = current.publishStartAt;
      } else if (current.publishStartAt == null && last.publishStartAt == null) {
    
      } else if ((current.publishStartAt != null && last.publishStartAt == null) || (current.publishStartAt == null && last.publishStartAt != null)) {
        diff.publishStartAt = current.publishStartAt;
      } else if (!equals(last.publishStartAt, current.publishStartAt)) {
        diff.publishStartAt = current.publishStartAt;
      }
    
      if (current.publishEndAt === null && last.publishEndAt === undefined) {
        diff.publishEndAt = current.publishEndAt;
      } else if (current.publishEndAt == null && last.publishEndAt == null) {
    
      } else if ((current.publishEndAt != null && last.publishEndAt == null) || (current.publishEndAt == null && last.publishEndAt != null)) {
        diff.publishEndAt = current.publishEndAt;
      } else if (!equals(last.publishEndAt, current.publishEndAt)) {
        diff.publishEndAt = current.publishEndAt;
      }
    
      if (current.createdBy === null && last.createdBy === undefined) {
        diff.createdBy = current.createdBy;
      } else if (current.createdBy == null && last.createdBy == null) {
    
      } else if ((current.createdBy != null && last.createdBy == null) || (current.createdBy == null && last.createdBy != null)) {
        diff.createdBy = current.createdBy;
      } else if (last.createdBy !== current.createdBy) {
        diff.createdBy = current.createdBy;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-announcements_2000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.title !== 'undefined') {
        ret.title = entity.title;
      }
    
      if (typeof entity.bodyMarkdown !== 'undefined') {
        ret.bodyMarkdown = clone(entity.bodyMarkdown);
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.importance !== 'undefined') {
        ret.importance = entity.importance;
      }
    
      if (typeof entity.publishStartAt !== 'undefined') {
        ret.publishStartAt = clone(processDateProperty(entity.publishStartAt));
      }
    
      if (typeof entity.publishEndAt !== 'undefined') {
        ret.publishEndAt = clone(processDateProperty(entity.publishEndAt));
      }
    
      if (typeof entity.createdBy !== 'undefined') {
        ret.createdBy = entity.createdBy;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-announcements_2000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity AnnouncementEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.title !== 'undefined') {
        ret.title = result.title;
        mapped.title = true;
      }
      if (typeof result.body_markdown !== 'undefined') {
        ret.bodyMarkdown = result.body_markdown;
        mapped.body_markdown = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.importance !== 'undefined') {
        ret.importance = result.importance;
        mapped.importance = true;
      }
      if (typeof result.publish_start_at !== 'undefined') {
        if (result.publish_start_at == null || result.publish_start_at instanceof Date) {
          ret.publishStartAt = result.publish_start_at;
        } else if (typeof result.publish_start_at === 'bigint') {
          ret.publishStartAt = parseDate(Number(result.publish_start_at));
        } else if (typeof result.publish_start_at === 'number' || result.publish_start_at.includes('+') || result.publish_start_at.lastIndexOf('-') > 10 || result.publish_start_at.endsWith('Z')) {
          ret.publishStartAt = parseDate(result.publish_start_at);
        } else {
          ret.publishStartAt = parseDate(result.publish_start_at + 'Z');
        }
        mapped.publish_start_at = true;
      }
      if (typeof result.publish_end_at !== 'undefined') {
        if (result.publish_end_at == null || result.publish_end_at instanceof Date) {
          ret.publishEndAt = result.publish_end_at;
        } else if (typeof result.publish_end_at === 'bigint') {
          ret.publishEndAt = parseDate(Number(result.publish_end_at));
        } else if (typeof result.publish_end_at === 'number' || result.publish_end_at.includes('+') || result.publish_end_at.lastIndexOf('-') > 10 || result.publish_end_at.endsWith('Z')) {
          ret.publishEndAt = parseDate(result.publish_end_at);
        } else {
          ret.publishEndAt = parseDate(result.publish_end_at + 'Z');
        }
        mapped.publish_end_at = true;
      }
      if (typeof result.created_by !== 'undefined') {
        ret.createdBy = result.created_by;
        mapped.created_by = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-announcements_2000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AnnouncementEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-announcements_2000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AnnouncementEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-announcements_2000': function(isEntityOrRef) {
    // compiled pk getter for entity AnnouncementEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-announcements_2000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AnnouncementEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-announcements_2000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AnnouncementEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-admin_webauthn_credentials_1000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminWebauthnCredentialEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.adminAccountId === null) {
        entity.adminAccountId = null;
      } else if (typeof data.adminAccountId !== 'undefined') {
        entity.adminAccountId = data.adminAccountId;
      }
      if (data.credentialId === null) {
        entity.credentialId = null;
      } else if (typeof data.credentialId !== 'undefined') {
        entity.credentialId = data.credentialId;
      }
      if (data.publicKey === null) {
        entity.publicKey = null;
      } else if (typeof data.publicKey !== 'undefined') {
        entity.publicKey = data.publicKey;
      }
      if (data.signCount === null) {
        entity.signCount = null;
      } else if (typeof data.signCount !== 'undefined') {
        entity.signCount = data.signCount;
      }
      if (data.transports === null) {
        entity.transports = null;
      } else if (typeof data.transports !== 'undefined') {
        entity.transports = data.transports;
      }
      if (data.aaguid === null) {
        entity.aaguid = null;
      } else if (typeof data.aaguid !== 'undefined') {
        entity.aaguid = data.aaguid;
      }
      if (data.nickname === null) {
        entity.nickname = null;
      } else if (typeof data.nickname !== 'undefined') {
        entity.nickname = data.nickname;
      }
      if (data.lastUsedAt === null) {
        entity.lastUsedAt = null;
      } else if (typeof data.lastUsedAt !== 'undefined') {
        if (data.lastUsedAt instanceof Date) {
          entity.lastUsedAt = data.lastUsedAt;
        } else if (typeof data.lastUsedAt === 'number' || data.lastUsedAt.includes('+') || data.lastUsedAt.lastIndexOf('-') > 10 || data.lastUsedAt.endsWith('Z')) {
          entity.lastUsedAt = new Date(data.lastUsedAt);
        } else {
          entity.lastUsedAt = new Date(data.lastUsedAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'hydrator-admin_webauthn_credentials_1000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminWebauthnCredentialEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.adminAccountId === null) {
        entity.adminAccountId = null;
      } else if (typeof data.adminAccountId !== 'undefined') {
        entity.adminAccountId = data.adminAccountId;
      }
      if (data.credentialId === null) {
        entity.credentialId = null;
      } else if (typeof data.credentialId !== 'undefined') {
        entity.credentialId = data.credentialId;
      }
      if (data.publicKey === null) {
        entity.publicKey = null;
      } else if (typeof data.publicKey !== 'undefined') {
        entity.publicKey = data.publicKey;
      }
      if (data.signCount === null) {
        entity.signCount = null;
      } else if (typeof data.signCount !== 'undefined') {
        entity.signCount = data.signCount;
      }
      if (data.transports === null) {
        entity.transports = null;
      } else if (typeof data.transports !== 'undefined') {
        entity.transports = data.transports;
      }
      if (data.aaguid === null) {
        entity.aaguid = null;
      } else if (typeof data.aaguid !== 'undefined') {
        entity.aaguid = data.aaguid;
      }
      if (data.nickname === null) {
        entity.nickname = null;
      } else if (typeof data.nickname !== 'undefined') {
        entity.nickname = data.nickname;
      }
      if (data.lastUsedAt === null) {
        entity.lastUsedAt = null;
      } else if (typeof data.lastUsedAt !== 'undefined') {
        if (data.lastUsedAt instanceof Date) {
          entity.lastUsedAt = data.lastUsedAt;
        } else if (typeof data.lastUsedAt === 'number' || data.lastUsedAt.includes('+') || data.lastUsedAt.lastIndexOf('-') > 10 || data.lastUsedAt.endsWith('Z')) {
          entity.lastUsedAt = new Date(data.lastUsedAt);
        } else {
          entity.lastUsedAt = new Date(data.lastUsedAt + 'Z');
        }
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
    }
  },
  'comparator-admin_webauthn_credentials_1000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity AdminWebauthnCredentialEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.adminAccountId === null && last.adminAccountId === undefined) {
        diff.adminAccountId = current.adminAccountId;
      } else if (current.adminAccountId == null && last.adminAccountId == null) {
    
      } else if ((current.adminAccountId != null && last.adminAccountId == null) || (current.adminAccountId == null && last.adminAccountId != null)) {
        diff.adminAccountId = current.adminAccountId;
      } else if (last.adminAccountId !== current.adminAccountId) {
        diff.adminAccountId = current.adminAccountId;
      }
    
      if (current.credentialId === null && last.credentialId === undefined) {
        diff.credentialId = current.credentialId;
      } else if (current.credentialId == null && last.credentialId == null) {
    
      } else if ((current.credentialId != null && last.credentialId == null) || (current.credentialId == null && last.credentialId != null)) {
        diff.credentialId = current.credentialId;
      } else if (last.credentialId !== current.credentialId) {
        diff.credentialId = current.credentialId;
      }
    
      if (current.publicKey === null && last.publicKey === undefined) {
        diff.publicKey = current.publicKey;
      } else if (current.publicKey == null && last.publicKey == null) {
    
      } else if ((current.publicKey != null && last.publicKey == null) || (current.publicKey == null && last.publicKey != null)) {
        diff.publicKey = current.publicKey;
      } else if (last.publicKey !== current.publicKey) {
        diff.publicKey = current.publicKey;
      }
    
      if (current.signCount === null && last.signCount === undefined) {
        diff.signCount = current.signCount;
      } else if (current.signCount == null && last.signCount == null) {
    
      } else if ((current.signCount != null && last.signCount == null) || (current.signCount == null && last.signCount != null)) {
        diff.signCount = current.signCount;
      } else if (!equals(last.signCount, current.signCount)) {
        diff.signCount = current.signCount;
      }
    
      if (current.transports === null && last.transports === undefined) {
        diff.transports = current.transports;
      } else if (current.transports == null && last.transports == null) {
    
      } else if ((current.transports != null && last.transports == null) || (current.transports == null && last.transports != null)) {
        diff.transports = current.transports;
      } else if (last.transports !== current.transports) {
        diff.transports = current.transports;
      }
    
      if (current.aaguid === null && last.aaguid === undefined) {
        diff.aaguid = current.aaguid;
      } else if (current.aaguid == null && last.aaguid == null) {
    
      } else if ((current.aaguid != null && last.aaguid == null) || (current.aaguid == null && last.aaguid != null)) {
        diff.aaguid = current.aaguid;
      } else if (last.aaguid !== current.aaguid) {
        diff.aaguid = current.aaguid;
      }
    
      if (current.nickname === null && last.nickname === undefined) {
        diff.nickname = current.nickname;
      } else if (current.nickname == null && last.nickname == null) {
    
      } else if ((current.nickname != null && last.nickname == null) || (current.nickname == null && last.nickname != null)) {
        diff.nickname = current.nickname;
      } else if (last.nickname !== current.nickname) {
        diff.nickname = current.nickname;
      }
    
      if (current.lastUsedAt === null && last.lastUsedAt === undefined) {
        diff.lastUsedAt = current.lastUsedAt;
      } else if (current.lastUsedAt == null && last.lastUsedAt == null) {
    
      } else if ((current.lastUsedAt != null && last.lastUsedAt == null) || (current.lastUsedAt == null && last.lastUsedAt != null)) {
        diff.lastUsedAt = current.lastUsedAt;
      } else if (!equals(last.lastUsedAt, current.lastUsedAt)) {
        diff.lastUsedAt = current.lastUsedAt;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-admin_webauthn_credentials_1000': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.adminAccountId !== 'undefined') {
        ret.adminAccountId = entity.adminAccountId;
      }
    
      if (typeof entity.credentialId !== 'undefined') {
        ret.credentialId = entity.credentialId;
      }
    
      if (typeof entity.publicKey !== 'undefined') {
        ret.publicKey = entity.publicKey;
      }
    
      if (typeof entity.signCount !== 'undefined') {
        ret.signCount = clone(entity.signCount);
      }
    
      if (typeof entity.transports !== 'undefined') {
        ret.transports = entity.transports;
      }
    
      if (typeof entity.aaguid !== 'undefined') {
        ret.aaguid = entity.aaguid;
      }
    
      if (typeof entity.nickname !== 'undefined') {
        ret.nickname = entity.nickname;
      }
    
      if (typeof entity.lastUsedAt !== 'undefined') {
        ret.lastUsedAt = clone(processDateProperty(entity.lastUsedAt));
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      return ret;
    }
  },
  'resultMapper-admin_webauthn_credentials_1000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity AdminWebauthnCredentialEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.admin_account_id !== 'undefined') {
        ret.adminAccountId = result.admin_account_id;
        mapped.admin_account_id = true;
      }
      if (typeof result.credential_id !== 'undefined') {
        ret.credentialId = result.credential_id;
        mapped.credential_id = true;
      }
      if (typeof result.public_key !== 'undefined') {
        ret.publicKey = result.public_key;
        mapped.public_key = true;
      }
      if (typeof result.sign_count !== 'undefined') {
        ret.signCount = result.sign_count;
        mapped.sign_count = true;
      }
      if (typeof result.transports !== 'undefined') {
        ret.transports = result.transports;
        mapped.transports = true;
      }
      if (typeof result.aaguid !== 'undefined') {
        ret.aaguid = result.aaguid;
        mapped.aaguid = true;
      }
      if (typeof result.nickname !== 'undefined') {
        ret.nickname = result.nickname;
        mapped.nickname = true;
      }
      if (typeof result.last_used_at !== 'undefined') {
        if (result.last_used_at == null || result.last_used_at instanceof Date) {
          ret.lastUsedAt = result.last_used_at;
        } else if (typeof result.last_used_at === 'bigint') {
          ret.lastUsedAt = parseDate(Number(result.last_used_at));
        } else if (typeof result.last_used_at === 'number' || result.last_used_at.includes('+') || result.last_used_at.lastIndexOf('-') > 10 || result.last_used_at.endsWith('Z')) {
          ret.lastUsedAt = parseDate(result.last_used_at);
        } else {
          ret.lastUsedAt = parseDate(result.last_used_at + 'Z');
        }
        mapped.last_used_at = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-admin_webauthn_credentials_1000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminWebauthnCredentialEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-admin_webauthn_credentials_1000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminWebauthnCredentialEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-admin_webauthn_credentials_1000': function(isEntityOrRef) {
    // compiled pk getter for entity AdminWebauthnCredentialEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-admin_webauthn_credentials_1000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AdminWebauthnCredentialEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-admin_webauthn_credentials_1000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AdminWebauthnCredentialEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-admin_accounts_0-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminAccountEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.email === null) {
        entity.email = null;
      } else if (typeof data.email !== 'undefined') {
        entity.email = data.email;
      }
      if (data.emailNormalized === null) {
        entity.emailNormalized = null;
      } else if (typeof data.emailNormalized !== 'undefined') {
        entity.emailNormalized = data.emailNormalized;
      }
      if (data.passwordHash === null) {
        entity.passwordHash = null;
      } else if (typeof data.passwordHash !== 'undefined') {
        entity.passwordHash = data.passwordHash;
      }
      if (data.role === null) {
        entity.role = null;
      } else if (typeof data.role !== 'undefined') {
        entity.role = data.role;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'hydrator-admin_accounts_0-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminAccountEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
      if (data.email === null) {
        entity.email = null;
      } else if (typeof data.email !== 'undefined') {
        entity.email = data.email;
      }
      if (data.emailNormalized === null) {
        entity.emailNormalized = null;
      } else if (typeof data.emailNormalized !== 'undefined') {
        entity.emailNormalized = data.emailNormalized;
      }
      if (data.passwordHash === null) {
        entity.passwordHash = null;
      } else if (typeof data.passwordHash !== 'undefined') {
        entity.passwordHash = data.passwordHash;
      }
      if (data.role === null) {
        entity.role = null;
      } else if (typeof data.role !== 'undefined') {
        entity.role = data.role;
      }
      if (data.status === null) {
        entity.status = null;
      } else if (typeof data.status !== 'undefined') {
        entity.status = data.status;
      }
      if (data.createdAt === null) {
        entity.createdAt = null;
      } else if (typeof data.createdAt !== 'undefined') {
        if (data.createdAt instanceof Date) {
          entity.createdAt = data.createdAt;
        } else if (typeof data.createdAt === 'number' || data.createdAt.includes('+') || data.createdAt.lastIndexOf('-') > 10 || data.createdAt.endsWith('Z')) {
          entity.createdAt = new Date(data.createdAt);
        } else {
          entity.createdAt = new Date(data.createdAt + 'Z');
        }
      }
      if (data.updatedAt === null) {
        entity.updatedAt = null;
      } else if (typeof data.updatedAt !== 'undefined') {
        if (data.updatedAt instanceof Date) {
          entity.updatedAt = data.updatedAt;
        } else if (typeof data.updatedAt === 'number' || data.updatedAt.includes('+') || data.updatedAt.lastIndexOf('-') > 10 || data.updatedAt.endsWith('Z')) {
          entity.updatedAt = new Date(data.updatedAt);
        } else {
          entity.updatedAt = new Date(data.updatedAt + 'Z');
        }
      }
    }
  },
  'comparator-admin_accounts_0': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
    // compiled comparator for entity AdminAccountEntity
    return function(last, current, options) {
      const diff = {};
      if (current.id === null && last.id === undefined) {
        diff.id = current.id;
      } else if (current.id == null && last.id == null) {
    
      } else if ((current.id != null && last.id == null) || (current.id == null && last.id != null)) {
        diff.id = current.id;
      } else if (last.id !== current.id) {
        diff.id = current.id;
      }
    
      if (current.email === null && last.email === undefined) {
        diff.email = current.email;
      } else if (current.email == null && last.email == null) {
    
      } else if ((current.email != null && last.email == null) || (current.email == null && last.email != null)) {
        diff.email = current.email;
      } else if (last.email !== current.email) {
        diff.email = current.email;
      }
    
      if (current.emailNormalized === null && last.emailNormalized === undefined) {
        diff.emailNormalized = current.emailNormalized;
      } else if (current.emailNormalized == null && last.emailNormalized == null) {
    
      } else if ((current.emailNormalized != null && last.emailNormalized == null) || (current.emailNormalized == null && last.emailNormalized != null)) {
        diff.emailNormalized = current.emailNormalized;
      } else if (last.emailNormalized !== current.emailNormalized) {
        diff.emailNormalized = current.emailNormalized;
      }
    
      if (current.passwordHash === null && last.passwordHash === undefined) {
        diff.passwordHash = current.passwordHash;
      } else if (current.passwordHash == null && last.passwordHash == null) {
    
      } else if ((current.passwordHash != null && last.passwordHash == null) || (current.passwordHash == null && last.passwordHash != null)) {
        diff.passwordHash = current.passwordHash;
      } else if (last.passwordHash !== current.passwordHash) {
        diff.passwordHash = current.passwordHash;
      }
    
      if (current.role === null && last.role === undefined) {
        diff.role = current.role;
      } else if (current.role == null && last.role == null) {
    
      } else if ((current.role != null && last.role == null) || (current.role == null && last.role != null)) {
        diff.role = current.role;
      } else if (last.role !== current.role) {
        diff.role = current.role;
      }
    
      if (current.status === null && last.status === undefined) {
        diff.status = current.status;
      } else if (current.status == null && last.status == null) {
    
      } else if ((current.status != null && last.status == null) || (current.status == null && last.status != null)) {
        diff.status = current.status;
      } else if (last.status !== current.status) {
        diff.status = current.status;
      }
    
      if (current.createdAt === null && last.createdAt === undefined) {
        diff.createdAt = current.createdAt;
      } else if (current.createdAt == null && last.createdAt == null) {
    
      } else if ((current.createdAt != null && last.createdAt == null) || (current.createdAt == null && last.createdAt != null)) {
        diff.createdAt = current.createdAt;
      } else if (!equals(last.createdAt, current.createdAt)) {
        diff.createdAt = current.createdAt;
      }
    
      if (current.updatedAt === null && last.updatedAt === undefined) {
        diff.updatedAt = current.updatedAt;
      } else if (current.updatedAt == null && last.updatedAt == null) {
    
      } else if ((current.updatedAt != null && last.updatedAt == null) || (current.updatedAt == null && last.updatedAt != null)) {
        diff.updatedAt = current.updatedAt;
      } else if (!equals(last.updatedAt, current.updatedAt)) {
        diff.updatedAt = current.updatedAt;
      }
    
    if (options?.includeInverseSides) {
    }
      return diff;
    }
  },
  'snapshotGenerator-admin_accounts_0': function(clone, cloneEmbeddable, processDateProperty) {
    return function(entity) {
      const ret = {};
      if (typeof entity.id !== 'undefined') {
        ret.id = entity.id;
      }
    
      if (typeof entity.email !== 'undefined') {
        ret.email = entity.email;
      }
    
      if (typeof entity.emailNormalized !== 'undefined') {
        ret.emailNormalized = entity.emailNormalized;
      }
    
      if (typeof entity.passwordHash !== 'undefined') {
        ret.passwordHash = entity.passwordHash;
      }
    
      if (typeof entity.role !== 'undefined') {
        ret.role = entity.role;
      }
    
      if (typeof entity.status !== 'undefined') {
        ret.status = entity.status;
      }
    
      if (typeof entity.createdAt !== 'undefined') {
        ret.createdAt = clone(processDateProperty(entity.createdAt));
      }
    
      if (typeof entity.updatedAt !== 'undefined') {
        ret.updatedAt = clone(processDateProperty(entity.updatedAt));
      }
    
      return ret;
    }
  },
  'resultMapper-admin_accounts_0': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity AdminAccountEntity
    return function(result) {
      const ret = {};
      const mapped = {};
      if (typeof result.id !== 'undefined') {
        ret.id = result.id;
        mapped.id = true;
      }
      if (typeof result.email !== 'undefined') {
        ret.email = result.email;
        mapped.email = true;
      }
      if (typeof result.email_normalized !== 'undefined') {
        ret.emailNormalized = result.email_normalized;
        mapped.email_normalized = true;
      }
      if (typeof result.password_hash !== 'undefined') {
        ret.passwordHash = result.password_hash;
        mapped.password_hash = true;
      }
      if (typeof result.role !== 'undefined') {
        ret.role = result.role;
        mapped.role = true;
      }
      if (typeof result.status !== 'undefined') {
        ret.status = result.status;
        mapped.status = true;
      }
      if (typeof result.created_at !== 'undefined') {
        if (result.created_at == null || result.created_at instanceof Date) {
          ret.createdAt = result.created_at;
        } else if (typeof result.created_at === 'bigint') {
          ret.createdAt = parseDate(Number(result.created_at));
        } else if (typeof result.created_at === 'number' || result.created_at.includes('+') || result.created_at.lastIndexOf('-') > 10 || result.created_at.endsWith('Z')) {
          ret.createdAt = parseDate(result.created_at);
        } else {
          ret.createdAt = parseDate(result.created_at + 'Z');
        }
        mapped.created_at = true;
      }
      if (typeof result.updated_at !== 'undefined') {
        if (result.updated_at == null || result.updated_at instanceof Date) {
          ret.updatedAt = result.updated_at;
        } else if (typeof result.updated_at === 'bigint') {
          ret.updatedAt = parseDate(Number(result.updated_at));
        } else if (typeof result.updated_at === 'number' || result.updated_at.includes('+') || result.updated_at.lastIndexOf('-') > 10 || result.updated_at.endsWith('Z')) {
          ret.updatedAt = parseDate(result.updated_at);
        } else {
          ret.updatedAt = parseDate(result.updated_at + 'Z');
        }
        mapped.updated_at = true;
      }
      for (let k in result) { if (Object.hasOwn(result, k) && !mapped[k] && ret[k] === undefined) ret[k] = result[k]; }
      return ret;
    }
  },
  'hydrator-admin_accounts_0-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminAccountEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-admin_accounts_0-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AdminAccountEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-admin_accounts_0': function(isEntityOrRef) {
    // compiled pk getter for entity AdminAccountEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-admin_accounts_0': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AdminAccountEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-admin_accounts_0': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AdminAccountEntity
    return function(entity) {
      return '' + entity.id;
    }
  }
};
