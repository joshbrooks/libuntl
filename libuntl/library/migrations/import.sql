DROP SCHEMA IF EXISTS importer CASCADE;
CREATE SCHEMA IF NOT EXISTS importer;
create table IF NOT EXISTS importer.library_tag
(
  id serial not null
    constraint library_tag_pkey
    primary key,
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  name jsonb,
  description jsonb
)
;

SELECT jsonb_strip_nulls(jsonb_build_object('en', name_en, 'tet', name_tet, 'pt', name_pt, 'id', name_ind)) from library_tag;

INSERT INTO importer.library_tag( id,
                                  created, modified, name)
  SELECT id, now(), now(), jsonb_strip_nulls(jsonb_build_object('en', name_en, 'tet', name_tet, 'pt', name_pt, 'id', name_ind))
  FROM public.library_tag WHERE id NOT IN (SELECT id FROM importer.library_tag);

create table if not exists importer.library_publicationtype
(
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  id text not null
    constraint library_publicationtype_pkey
    primary key,
  name jsonb not null,
  description jsonb
)
;

INSERT INTO importer.library_publicationtype(created, modified, id, name)
  SELECT now(), now(), code, jsonb_strip_nulls(jsonb_build_object('en', name_en, 'tet', name_tet, 'pt', name_pt, 'id', name_ind))  FROM library_pubtype;

create table if not exists importer.library_resource
(
  id serial not null
    constraint library_resource_pkey
    primary key,
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  year integer,
  name jsonb,
  description jsonb,
  cover varchar(200),
  pubtype_id text not null
    constraint library_resou_pubtype_id_525ecb73_fk_library_publicationtype_id
    references importer.library_publicationtype
    deferrable initially deferred,
  user_id integer
    constraint library_resource_user_id_b77ee80f_fk_auth_user_id
    references auth_user
    deferrable initially deferred
)
;

INSERT INTO importer.library_resource(id, created, modified, year, name, description, pubtype_id)
  SELECT id, now(), now(), year,
    jsonb_strip_nulls(jsonb_build_object('en', name_en, 'tet', name_tet, 'pt', name_pt, 'id', name_ind)),
    jsonb_strip_nulls(jsonb_build_object('en', description_en, 'tet', description_tet, 'pt', description_pt, 'id', description_ind)), pubtype_id
  FROM library_publication;

DROP TABLE IF EXISTS importer.library_link;
create table if not exists importer.library_link
(
  id serial not null
    constraint library_link_pkey
    primary key,
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  cover varchar(200),
  language text,
  title text,
  url varchar(200),
  file varchar(200),
  resource_id integer not null
    constraint library_link_resource_base_id_ee87c477_fk_library_resource_id
    references importer.library_resource
    deferrable initially deferred
)
;

INSERT INTO importer.library_link(created, modified, cover, language, title, url, file, resource_id)
  SELECT now(), now(), cover_en, 'en', title_en, url_en, upload_en, publication_id FROM library_version WHERE upload_en != ''  OR url_en != '' ;

INSERT INTO importer.library_link(created, modified, cover, language, title, url, file, resource_id)
  SELECT now(), now(), cover_tet, 'tet', title_tet, url_tet, upload_tet, publication_id FROM library_version  WHERE upload_tet != ''  OR url_tet != '' ;

INSERT INTO importer.library_link(created, modified, cover, language, title, url, file, resource_id)
  SELECT now(), now(), cover_ind, 'id', title_ind, url_ind, upload_ind, publication_id FROM library_version WHERE upload_ind != '' OR url_ind != '';

INSERT INTO importer.library_link(created, modified, cover, language, title, url, file, resource_id)
  SELECT now(), now(), cover_pt, 'pt', title_pt, url_pt, upload_pt, publication_id FROM library_version  WHERE upload_pt != ''  OR url_pt != '' ;


DROP TABLE IF EXISTS importer.library_resource_tag;
create table importer.library_resource_tag
(
  id serial not null
    constraint library_resource_tag_pkey
    primary key,
  resource_id integer not null
    constraint library_resource_ta_resource_id_3821ac42_fk_library_resource_id
    references importer.library_resource
    deferrable initially deferred,
  tag_id integer not null
    constraint library_resource_tag_tag_id_62f67c50_fk_library_tag_id
    references importer.library_tag
    deferrable initially deferred,
  constraint library_resource_tag_resource_id_7c422b36_uniq
  unique (resource_id, tag_id)
)
;

INSERT INTO importer.library_resource_tag(tag_id, resource_id)
  SELECT DISTINCT
    library_tag.id,
    library_publication.id
  FROM
    public.library_version,
    public.library_publication,
    public.library_version_tag,
    public.library_tag
  WHERE
    library_version.publication_id = library_publication.id AND
    library_version_tag.version_id = library_version.id AND
    library_version_tag.tag_id = library_tag.id;

create table importer.library_author
(
  id serial not null
    constraint library_author_pkey
    primary key,
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  name jsonb
)
;
INSERT INTO importer.library_author(id, created, modified, name)
  SELECT id, now(), now(), jsonb_build_object('name', name) FROM library_author;

create table importer.library_resource_author
(
  id serial not null
    constraint library_resource_author_pkey
    primary key,
  resource_id integer not null
    constraint library_resource_au_resource_id_f3d5df97_fk_library_resource_id
    references importer.library_resource
    deferrable initially deferred,
  author_id integer not null
    constraint library_resource_author_author_id_3e6b7f75_fk_library_author_id
    references importer.library_author
    deferrable initially deferred,
  constraint library_resource_author_resource_id_4820a694_uniq
  unique (resource_id, author_id)
)
;

INSERT INTO importer.library_resource_author(resource_id, author_id) SELECT publication_id, author_id FROM library_publication_author;

create table importer.library_organizationtype
(
  id text not null
    constraint library_organizationtype_pkey
    primary key,
  name jsonb not null,
  description jsonb
);

INSERT INTO importer.library_organizationtype (id, name) SELECT code, jsonb_build_object('en', orgtype) FROM public.nhdb_organizationclass;


create table importer.library_organization
(
  id serial not null
    constraint library_organization_pkey
    primary key,
  created timestamp with time zone not null,
  modified timestamp with time zone not null,
  acronyms jsonb,
  description jsonb,
  contact jsonb,
  type_id text
    constraint library_organization_type_id_b39e6f18_fk_library_orgtype_id
    references importer.library_organizationtype
    deferrable initially deferred,
  name text
)
;

INSERT INTO importer.library_organization(
created, modified,
  id, name, description, contact, type_id)
  SELECT now(), now(), id, name,
    jsonb_strip_nulls(jsonb_build_object('en', description_en, 'tet', description_tet, 'pt', description_pt, 'id', description_ind)),
    jsonb_strip_nulls(jsonb_build_object(
                          'phone', phoneprimary,
                          'phone_secondary', phonesecondary,
                          'email', email,
                          'fax', fax,
                          'web', web,
                          'facebook', facebook
                      )), orgtype_id
  FROM public.nhdb_organization;

create table importer.library_resource_organization
(
	id serial not null
		constraint library_resource_organization_pkey
			primary key,
	resource_id integer not null
		constraint library_resource_or_resource_id_641c1f32_fk_library_resource_id
			references importer.library_resource
				deferrable initially deferred,
	organization_id integer not null
		constraint library_res_organization_id_1e0ae336_fk_library_organization_id
			references importer.library_organization
				deferrable initially deferred,
	constraint library_resource_organization_resource_id_769701c9_uniq
		unique (resource_id, organization_id)
)
;

insert into importer.library_resource_organization(resource_id, organization_id)
select distinct publication_id, organization_id from public.library_publication_organization;