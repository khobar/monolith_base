package pl.qprogramming.appbase.service.mapper;

import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import pl.qprogramming.appbase.domain.Account;
import pl.qprogramming.appbase.domain.Authority;
import pl.qprogramming.appbase.service.api.dto.AccountDTO;
import pl.qprogramming.appbase.service.api.dto.Role;
import pl.qprogramming.appbase.service.api.dto.UserDTO;

/**
 * Mapper for the entity {@link Account} and its DTO called {@link UserDTO}.
 * <p>
 * Normal mappers are generated using MapStruct, this one is hand-coded as MapStruct
 * support is still in beta, and requires a manual step with an IDE.
 */
@Mapper(componentModel = "spring")
public interface AccountMapper {
    List<UserDTO> accountsToUserDTOs(List<Account> accounts);

    UserDTO accountToUserDTO(Account account);

    List<AccountDTO> accountsToAccountDTOs(List<Account> accounts);

    AccountDTO accountToAccountDTO(Account account);

    List<Account> accountDTOsToAccounts(List<AccountDTO> accountDTOs);

    @Mapping(target = "login", source = "login", qualifiedByName = "toLowerCase")
    @Mapping(target = "email", source = "email", qualifiedByName = "toLowerCase")
    Account accountDTOToAccount(AccountDTO accountDTODTO);

    default Authority roleToAuthority(Role role) {
        return Authority.builder().name(role.toString()).build();
    }

    default Role authorityToRole(Authority auth) {
        return Role.fromValue(auth.getName());
    }

    @Named("toLowerCase")
    default String toLowerCase(String text) {
        if (StringUtils.isNotBlank(text)) {
            return text.toLowerCase();
        }
        return null;
    }
}
