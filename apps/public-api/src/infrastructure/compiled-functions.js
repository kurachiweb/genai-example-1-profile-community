'use strict';
module.exports = {
  __version: '7.1.5',
  'hydrator-users_0-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
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
  'hydrator-users_0-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
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
  'comparator-users_0': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
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
  'snapshotGenerator-users_0': function(clone, cloneEmbeddable, processDateProperty) {
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
  'resultMapper-users_0': function(PolymorphicRef, parseDate) {
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
  'hydrator-users_0-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-users_0-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity UserEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-users_0': function(isEntityOrRef) {
    // compiled pk getter for entity UserEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-users_0': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity UserEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-users_0': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity UserEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-sns_links_4000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, profiles_23, profiles_24) {
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
          entity.profile = factory.createReference(profiles_23, data.profile, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.profile && typeof data.profile === 'object') {
          entity.profile = factory.create(profiles_24, data.profile, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
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
  'hydrator-sns_links_4000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, profiles_31, profiles_32) {
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
          entity.profile = factory.createReference(profiles_31, data.profile, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.profile && typeof data.profile === 'object') {
          entity.profile = factory.create(profiles_32, data.profile, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
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
  'comparator-sns_links_4000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
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
  'snapshotGenerator-sns_links_4000': function(clone, cloneEmbeddable, toArray, EntityIdentifier, processDateProperty) {
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
  'resultMapper-sns_links_4000': function(PolymorphicRef, parseDate) {
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
  'hydrator-sns_links_4000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-sns_links_4000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity SnsLinkEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-sns_links_4000': function(isEntityOrRef) {
    // compiled pk getter for entity SnsLinkEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-sns_links_4000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity SnsLinkEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-sns_links_4000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity SnsLinkEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-profiles_3000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_41, users_42) {
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
          entity.user = factory.createReference(users_41, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_42, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
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
  'hydrator-profiles_3000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_55, users_56) {
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
          entity.user = factory.createReference(users_55, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_56, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
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
  'comparator-profiles_3000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
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
  'snapshotGenerator-profiles_3000': function(clone, cloneEmbeddable, toArray, EntityIdentifier, processDateProperty) {
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
  'resultMapper-profiles_3000': function(PolymorphicRef, parseDate) {
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
  'hydrator-profiles_3000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-profiles_3000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ProfileEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-profiles_3000': function(isEntityOrRef) {
    // compiled pk getter for entity ProfileEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-profiles_3000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity ProfileEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-profiles_3000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity ProfileEntity
    return function(entity) {
      return '' + entity.id;
    }
  },
  'hydrator-app_settings_2000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
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
  'hydrator-app_settings_2000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
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
  'comparator-app_settings_2000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
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
  'snapshotGenerator-app_settings_2000': function(clone, cloneEmbeddable, processDateProperty) {
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
  'resultMapper-app_settings_2000': function(PolymorphicRef, parseDate) {
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
  'hydrator-app_settings_2000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
    }
  },
  'hydrator-app_settings_2000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity AppSettingEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.key === null) {
        entity.key = null;
      } else if (typeof data.key !== 'undefined') {
        entity.key = data.key;
      }
    }
  },
  'pkGetter-app_settings_2000': function(isEntityOrRef) {
    // compiled pk getter for entity AppSettingEntity
    return function(entity) {
      return entity.key;
    }
  },
  'pkGetterConverted-app_settings_2000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity AppSettingEntity
    return function(entity) {
      return entity.key;
    }
  },
  'pkSerializer-app_settings_2000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity AppSettingEntity
    return function(entity) {
      return '' + entity.key;
    }
  },
  'hydrator-api_keys_1000-full-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_79, users_80) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
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
          entity.user = factory.createReference(users_79, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_80, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
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
  'hydrator-api_keys_1000-full-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError, users_89, users_90) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
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
          entity.user = factory.createReference(users_89, data.user, { merge: true, convertCustomTypes, normalizeAccessors, schema });
        } else if (data.user && typeof data.user === 'object') {
          entity.user = factory.create(users_90, data.user, { initialized: true, merge: true, newEntity, convertCustomTypes, normalizeAccessors, schema });
        }
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
  'comparator-api_keys_1000': function(compareArrays, compareBooleans, compareBuffers, compareObjects, equals) {
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
    
      if (current.user === null && last.user === undefined) {
        diff.user = current.user;
      } else if (current.user == null && last.user == null) {
    
      } else if ((current.user != null && last.user == null) || (current.user == null && last.user != null)) {
        diff.user = current.user;
      } else if (last.user !== current.user) {
        diff.user = current.user;
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
  'snapshotGenerator-api_keys_1000': function(clone, cloneEmbeddable, toArray, EntityIdentifier, processDateProperty) {
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
  'resultMapper-api_keys_1000': function(PolymorphicRef, parseDate) {
    // compiled mapper for entity ApiKeyEntity
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
  'hydrator-api_keys_1000-reference-false': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'hydrator-api_keys_1000-reference-true': function(isPrimaryKey, isEntity, isScalarReference, Collection, Reference, PolymorphicRef, ValidationError) {
    // compiled hydrator for entity ApiKeyEntity ( normalized)
    return function(entity, data, factory, newEntity, convertCustomTypes, schema, parentSchema, normalizeAccessors) {
      if (data.id === null) {
        entity.id = null;
      } else if (typeof data.id !== 'undefined') {
        entity.id = data.id;
      }
    }
  },
  'pkGetter-api_keys_1000': function(isEntityOrRef) {
    // compiled pk getter for entity ApiKeyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkGetterConverted-api_keys_1000': function(isEntityOrRef) {
    // compiled pk getter (with converted custom types) for entity ApiKeyEntity
    return function(entity) {
      return entity.id;
    }
  },
  'pkSerializer-api_keys_1000': function(isEntityOrRef, getCompositeKeyValue, getPrimaryKeyHash) {
    // compiled pk serializer for entity ApiKeyEntity
    return function(entity) {
      return '' + entity.id;
    }
  }
};
